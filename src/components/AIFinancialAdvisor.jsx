"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import PredictiveWealthForecast from "./PredictiveWealthForecast";
import FinancialHealthScorecard from "./FinancialHealthScorecard";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import { Send, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { makeId } from "@/utils/id";

async function getAIInsights(financialData) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "advisor", financialData }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  const json = await res.json();
  if (!json.result) throw new Error("Gemini returned an empty response.");
  return json.result;
}

const markdownComponents = {
  p: ({ children }) => <p className="mb-2">{children}</p>,
  strong: ({ children }) => <strong className="fw-semibold text-primary">{children}</strong>,
  ul: ({ children }) => <ul className="ps-3 mb-0 d-flex flex-column gap-2">{children}</ul>,
  ol: ({ children }) => <ol className="ps-3 mb-0 d-flex flex-column gap-2">{children}</ol>,
  li: ({ children }) => <li style={{listStyleType: "none", position: "relative"}}><span className="text-primary me-2 fw-bold">›</span>{children}</li>,
  h1: ({ children }) => <h3 className="h6 fw-semibold mb-2 mt-3">{children}</h3>,
  h2: ({ children }) => <h3 className="h6 fw-semibold mb-2 mt-3">{children}</h3>,
  h3: ({ children }) => <h3 className="h6 fw-semibold mb-2 mt-3">{children}</h3>,
};

function ErrorState({ message, onRetry }) {
  return (
    <div className="text-center py-4">
      <p className="text-danger small mb-3">{message}</p>
      <button type="button" className="btn btn-sm btn-outline-primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export default function AIFinancialAdvisor({ financialData }) {
  const { user, refreshUser } = useAuth();
  const { rawTransactions, setTransactions, deleteTransaction } = useApp();
  const hasData = Array.isArray(financialData) && financialData.length > 0;

  const [activeTab, setActiveTab] = useState("advisor"); // advisor | forecast | risk | copilot
  const [status, setStatus] = useState(() => (hasData ? "loading" : "idle"));
  const [insight, setInsight] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const latestRequestId = useRef(0);

  // Copilot Chat State
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  const runAnalysis = useCallback(async () => {
    if (!Array.isArray(financialData) || financialData.length === 0) return;

    const requestId = ++latestRequestId.current;
    setStatus("loading");
    setErrorMessage("");

    try {
      const text = await getAIInsights(financialData);
      if (requestId !== latestRequestId.current) return;
      setInsight(text);
      setStatus("success");
    } catch (err) {
      if (requestId !== latestRequestId.current) return;
      console.error("AI Financial Advisor error:", err);
      setStatus("error");
      setErrorMessage("Unable to fetch AI insights at this time.");
    }
  }, [financialData]);

  useEffect(() => {
    if (activeTab === "advisor") {
      runAnalysis();
    }
  }, [runAnalysis, activeTab]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, chatLoading]);

  async function callCopilot(currentHistory) {
    setChatLoading(true);
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          history: currentHistory, 
          financialData: rawTransactions, 
          userProfile: user 
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to process message");
      }
      
      const { text, rawParts, functionCalls } = json.result || {};
      
      let nextHistory = [...currentHistory];
      
      // If AI responds with text, add it
      if (text) {
        nextHistory.push({ role: "model", parts: rawParts || [{ text }] });
        setMessages([...nextHistory]);
      }

      // If AI wants to execute tools
      if (functionCalls && functionCalls.length > 0) {
        // Add the exact model response parts to history so thoughtSignature is preserved
        nextHistory.push({ role: "model", parts: rawParts || functionCalls.map(fc => ({ functionCall: fc })) });
        setMessages([...nextHistory]);

        const functionResponses = [];

        // Execute each tool locally
        for (const fc of functionCalls) {
          const { name, args, id } = fc;
          let result = { success: true };
          
          try {
            if (name === "add_transaction") {
              const newTx = {
                id: makeId("t"),
                date: args.date || new Date().toISOString().slice(0, 10),
                type: args.type,
                category: args.category,
                amount: Number(args.amount)
              };
              setTransactions(prev => [...prev, newTx]);
              result = { success: true, message: "Transaction added", id: newTx.id };
            } 
            else if (name === "delete_transaction") {
              deleteTransaction(args.id);
              result = { success: true, message: "Transaction deleted" };
            }
            else if (name === "update_profile") {
              const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(args)
              });
              if (!res.ok) throw new Error("Failed to update profile");
              await refreshUser();
              result = { success: true, message: "Profile updated" };
            }
          } catch (e) {
            result = { success: false, error: e.message };
          }
          
          functionResponses.push({
            functionResponse: {
              ...(id ? { id } : {}),
              name,
              response: { output: result }
            }
          });
        }
        
        // Add tool responses to history using 'user' role (Gemini API requirement)
        nextHistory.push({ role: "user", parts: functionResponses });
        setMessages([...nextHistory]);
        
        // Recursively call copilot so it can observe the result and generate a confirmation
        await callCopilot(nextHistory);
      }
    } catch (err) {
      console.error("Copilot Error:", err);
      setMessages(prev => [...prev, { role: "model", parts: [{ text: "Sorry, I encountered an error. Please try again." }] }]);
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    const userMessage = chatInput.trim();
    setChatInput("");
    
    const newHistory = [...messages, { role: "user", parts: [{ text: userMessage }] }];
    setMessages(newHistory);
    
    await callCopilot(newHistory);
  }

  return (
    <div className="app-card overflow-hidden">
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-10" style={{ background: "color-mix(in srgb, var(--bs-body-bg) 40%, transparent)" }}>
        <h5 className="mb-0 fw-bold fs-6 d-flex align-items-center gap-2">
          AI Command Center <span aria-hidden="true">✨</span>
        </h5>
        {activeTab === "advisor" && hasData && status !== "loading" && (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-pill px-3"
            onClick={runAnalysis}
          >
            Regenerate
          </button>
        )}
      </div>

      <div className="d-flex border-bottom border-secondary border-opacity-10 px-3 overflow-x-auto">
        {["advisor", "forecast", "risk", "copilot"].map((tab) => (
          <button
            key={tab}
            className={`btn btn-link text-decoration-none px-4 py-3 fw-medium text-nowrap ${activeTab === tab ? "text-primary border-bottom border-2 border-primary rounded-0" : "text-body-secondary"}`}
            onClick={() => setActiveTab(tab)}
            style={{ marginBottom: "-1px" }}
          >
            {tab === "advisor" && "General Advice"}
            {tab === "forecast" && "Wealth Forecast"}
            {tab === "risk" && "Risk Audit"}
            {tab === "copilot" && "Agent Copilot"}
          </button>
        ))}
      </div>

      <div className="p-0">
        {!hasData ? (
          <div className="p-4">
             <EmptyState
              title="No data to analyze yet"
              hint="Add a few transactions and check back for personalized saving recommendations."
            />
          </div>
        ) : (
          <div aria-live="polite" aria-atomic="true" style={{ minHeight: "300px" }}>
            {activeTab === "advisor" && (
              <div className="p-4">
                {status === "loading" && <SkeletonLoader />}
                {status === "error" && <ErrorState message={errorMessage} onRetry={runAnalysis} />}
                {status === "success" && (
                  <div className="fs-6 lh-lg text-body-secondary">
                    <ReactMarkdown components={markdownComponents}>{insight}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {activeTab === "forecast" && (
              <div className="p-4">
                <PredictiveWealthForecast transactions={financialData} />
              </div>
            )}

            {activeTab === "risk" && (
              <div className="p-4">
                <FinancialHealthScorecard transactions={financialData} />
              </div>
            )}

            {activeTab === "copilot" && (
              <div className="d-flex flex-column" style={{ height: "400px" }}>
                <div 
                  ref={chatScrollRef} 
                  className="flex-grow-1 p-3 overflow-y-auto d-flex flex-column gap-3" 
                  style={{ background: "color-mix(in srgb, var(--bs-body-bg) 50%, transparent)" }}
                >
                  {messages.length === 0 && (
                    <div className="text-center text-body-secondary my-auto p-4">
                      <Sparkles className="mb-3 text-primary opacity-50" size={32} />
                      <p className="small mb-1">Hi, I am your Financial Copilot!</p>
                      <p className="small opacity-75">I can add/delete transactions or update your goals for you.</p>
                      <div className="d-flex flex-wrap gap-2 justify-content-center mt-3">
                        <button 
                          type="button" 
                          onClick={() => setChatInput("Add $50 for Groceries")} 
                          className="btn btn-sm btn-outline-secondary rounded-pill fw-normal py-2 px-3 text-body-secondary small d-flex align-items-center"
                          style={{ minHeight: "44px" }}
                        >
                          Add $50 for Groceries
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setChatInput("Change my goal to 'Vacation'")} 
                          className="btn btn-sm btn-outline-secondary rounded-pill fw-normal py-2 px-3 text-body-secondary small d-flex align-items-center"
                          style={{ minHeight: "44px" }}
                        >
                          Change my goal to &apos;Vacation&apos;
                        </button>
                      </div>
                    </div>
                  )}
                  {messages.map((msg, i) => {
                    const isToolResponse = msg.parts?.some(p => p.functionResponse);
                    if (msg.role === "function" || isToolResponse) return null;
                    
                    const isUser = msg.role === "user";
                    const isToolCall = msg.parts?.some(p => p.functionCall);
                    
                    if (isToolCall) {
                      const isOngoing = chatLoading && i === messages.length - 1;
                      return (
                        <div key={i} className="d-flex align-self-start ms-2 mb-1">
                          <div className="small text-primary fst-italic d-flex align-items-center gap-1">
                            {isOngoing ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" style={{width: "0.8rem", height: "0.8rem"}} />
                                Executing action...
                              </>
                            ) : (
                              <span className="text-success fw-medium">✓ Action performed</span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    
                    const text = msg.parts?.find(p => p.text)?.text;
                    if (!text) return null;

                    return (
                      <div key={i} className={`d-flex ${isUser ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div 
                          className={`p-3 rounded-3 shadow-sm ${isUser ? 'bg-primary text-white' : 'bg-body border'}`}
                          style={{ maxWidth: "85%", borderRadius: isUser ? "1rem 1rem 0 1rem" : "1rem 1rem 1rem 0" }}
                        >
                           {isUser ? text : <ReactMarkdown components={{...markdownComponents, p: ({children}) => <p className="mb-0">{children}</p>}}>{text}</ReactMarkdown>}
                        </div>
                      </div>
                    );
                  })}
                  {chatLoading && !messages[messages.length - 1]?.parts?.some(p => p.functionCall) && (
                    <div className="d-flex justify-content-start">
                      <div className="p-3 rounded-3 bg-body border d-flex gap-1 align-items-center" style={{ borderRadius: "1rem 1rem 1rem 0" }}>
                         <span className="spinner-grow spinner-grow-sm text-primary opacity-50" style={{ animationDelay: "0ms" }} />
                         <span className="spinner-grow spinner-grow-sm text-primary opacity-50" style={{ animationDelay: "150ms" }} />
                         <span className="spinner-grow spinner-grow-sm text-primary opacity-50" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border-top">
                  <form onSubmit={handleSendMessage} className="position-relative d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control border bg-body-tertiary rounded-pill ps-4 py-2 pe-5"
                      placeholder="Ask me to add an expense or update your goals..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={chatLoading}
                      style={{ paddingRight: "56px" }}
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary rounded-circle p-0 position-absolute end-0 me-1 d-flex align-items-center justify-content-center" 
                      disabled={chatLoading || !chatInput.trim()}
                      style={{ width: "44px", height: "44px" }}
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
