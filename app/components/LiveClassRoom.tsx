"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type LocalUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  organization_id?: string | null;
  grade?: string | null;
};

type LiveClassRecord = {
  id: string;
  title: string;
  status?: string;
  teacher_name?: string;
  course_title?: string;
  is_open?: boolean;
  has_quiz?: boolean;
  quiz_count?: number;
  organization_id?: string | null;
  grade?: string | null;
};

type ChatMessage = {
  id: string;
  author: string;
  text: string;
  at: string;
};

const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:4000";

export function LiveClassRoom({ classId }: { classId: string }) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [liveClass, setLiveClass] = useState<LiveClassRecord | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [joined, setJoined] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [deviceFingerprint, setDeviceFingerprint] = useState("local-device");
  const [status, setStatus] = useState("");
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", author: "LearnLink", text: "Welcome to the live class.", at: new Date().toLocaleTimeString() }
  ]);
  const [notes, setNotes] = useState<string[]>([]);
  const [activeQuizId, setActiveQuizId] = useState("");

  const hasQuiz = Boolean(liveClass?.has_quiz || Number(liveClass?.quiz_count ?? 0) > 0);
  const participants = useMemo(() => [liveClass?.teacher_name ?? "Teacher", user?.name ?? "You", "Class assistant"].filter(Boolean), [liveClass, user]);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("learnlink_token");
    const savedUser = window.localStorage.getItem("learnlink_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser) as LocalUser);
    }
  }, []);

  useEffect(() => {
    if (token) void loadClass(token);
  }, [token, classId]);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = cameraStream;
  }, [cameraStream]);

  useEffect(() => {
    if (screenVideoRef.current) screenVideoRef.current.srcObject = screenStream;
  }, [screenStream]);

  useEffect(() => {
    return () => {
      stopStream(cameraStream);
      stopStream(screenStream);
    };
  }, [cameraStream, screenStream]);

  async function loadClass(activeToken: string) {
    const response = await fetch(`${gatewayUrl}/courses`, { headers: { authorization: `Bearer ${activeToken}` } });
    if (!response.ok) return;
    const data = await response.json();
    const found = (data.live_classes ?? []).find((item: LiveClassRecord) => String(item.id) === String(classId));
    setLiveClass(found ?? { id: classId, title: "Live class", status: "live" });
  }

  async function joinClass() {
    if (!token) return;
    const response = await fetch(`${gatewayUrl}/courses/live-classes/${encodeURIComponent(classId)}/join`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ registration_number: registrationNumber, device_fingerprint: deviceFingerprint })
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.message ?? data.error ?? "Could not join class.");
      return;
    }
    setJoined(true);
    setStatus(`Joined. Validated: ${Boolean(data.enrollment?.validated)}. One active device enforced.`);
  }

  async function toggleCamera() {
    if (cameraEnabled) {
      stopStream(cameraStream);
      setCameraStream(null);
      setCameraEnabled(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getAudioTracks().forEach((track) => { track.enabled = micEnabled; });
      setCameraStream(stream);
      setCameraEnabled(true);
      setStatus("Camera is on.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Camera permission failed.");
    }
  }

  async function toggleMic() {
    if (cameraStream) {
      const next = !micEnabled;
      cameraStream.getAudioTracks().forEach((track) => { track.enabled = next; });
      setMicEnabled(next);
      setStatus(next ? "Microphone unmuted." : "Microphone muted.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setCameraStream(stream);
      setMicEnabled(true);
      setStatus("Microphone is on.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Microphone permission failed.");
    }
  }

  async function toggleScreenShare() {
    if (screenStream) {
      stopStream(screenStream);
      setScreenStream(null);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      stream.getVideoTracks()[0]?.addEventListener("ended", () => setScreenStream(null));
      setScreenStream(stream);
      setStatus("Screen sharing started.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Screen share permission failed.");
    }
  }

  async function startQuiz() {
    if (!token || !user?.roles.includes("teacher")) return;
    const response = await fetch(`${gatewayUrl}/courses/live-classes/${encodeURIComponent(classId)}/quizzes/start`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ prompt: "Live class check-in quiz" })
    });
    const data = await response.json();
    if (response.ok) {
      setActiveQuizId(data.live_class_quiz?.id ?? "");
      setStatus("Quiz started and broadcast to active students.");
    } else {
      setStatus(data.error ?? "Quiz start failed.");
    }
  }

  async function submitQuizAnswer() {
    if (!token || !activeQuizId) {
      setStatus("No active quiz session yet.");
      return;
    }
    const response = await fetch(`${gatewayUrl}/courses/live-classes/quizzes/${encodeURIComponent(activeQuizId)}/submissions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ answers: { selected_option_index: 0 } })
    });
    setStatus(response.ok ? "Quiz answer submitted." : "Quiz submission failed.");
  }

  async function captureKeyPoints() {
    if (!token) return;
    const response = await fetch(`${gatewayUrl}/courses/live-classes/${encodeURIComponent(classId)}/key-points`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ transcript: messages.map((message) => message.text).join(". ") || "Teacher explained live class objectives and next steps." })
    });
    const data = await response.json();
    if (response.ok) {
      setNotes(data.key_points ?? []);
      setStatus("AI key points saved.");
    } else {
      setStatus(data.error ?? "Key points unavailable for this profile.");
    }
  }

  function sendMessage() {
    if (!chatText.trim()) return;
    setMessages((current) => current.concat({ id: crypto.randomUUID(), author: user?.name ?? "You", text: chatText.trim(), at: new Date().toLocaleTimeString() }));
    setChatText("");
  }

  function leaveClass() {
    stopStream(cameraStream);
    stopStream(screenStream);
    setCameraStream(null);
    setScreenStream(null);
    setCameraEnabled(false);
    setMicEnabled(false);
    setJoined(false);
    setStatus("You left the classroom.");
  }

  if (!token || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#07111f] p-6 text-white">
        <section className="max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h1 className="text-2xl font-black">Login required</h1>
          <p className="mt-3 text-slate-300">Sign in first, then open the live class route.</p>
          <Link className="mt-5 inline-flex rounded-lg bg-violet-600 px-4 py-2 font-black" href="/courses">Back to courses</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-5 py-4">
        <div>
          <h1 className="text-2xl font-black">{liveClass?.title ?? "Live Class"}</h1>
          <p className="text-sm text-slate-400">Validated route: /live/{classId} | Device: {deviceFingerprint}</p>
        </div>
        <Link className="rounded-lg border border-white/10 px-4 py-2 font-bold" href="/courses">Back to courses</Link>
      </header>

      <section className="grid gap-4 p-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="grid gap-4 lg:grid-cols-2">
            <VideoTile title={cameraEnabled ? user.name : "Camera off"}>
              {cameraEnabled ? <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full rounded-xl object-cover" /> : null}
            </VideoTile>
            <VideoTile title={screenStream ? "Screen share" : "No screen shared"}>
              {screenStream ? <video ref={screenVideoRef} autoPlay muted playsInline className="h-full w-full rounded-xl object-cover" /> : null}
            </VideoTile>
            <VideoTile title={liveClass?.teacher_name ?? "Teacher video"} />
            <VideoTile title="Class material" />
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-950 p-4">
            <div className="grid gap-3 md:grid-cols-[180px_1fr_1fr]">
              <input className="rounded-lg border border-white/10 bg-[#07111f] p-3" placeholder="Registration number" value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value)} />
              <input className="rounded-lg border border-white/10 bg-[#07111f] p-3" placeholder="Device fingerprint" value={deviceFingerprint} onChange={(event) => setDeviceFingerprint(event.target.value)} />
              <button className="rounded-lg bg-violet-600 px-4 py-2 font-black" onClick={joinClass}>{joined ? "Re-validate session" : "Join class"}</button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button className="rounded-lg bg-violet-600 px-4 py-2 font-black" onClick={toggleMic}>{micEnabled ? "Mute" : "Unmute"}</button>
              <button className="rounded-lg bg-violet-600 px-4 py-2 font-black" onClick={toggleCamera}>{cameraEnabled ? "Stop camera" : "Camera"}</button>
              <button className="rounded-lg bg-violet-600 px-4 py-2 font-black" onClick={toggleScreenShare}>{screenStream ? "Stop sharing" : "Share screen"}</button>
              <button className="rounded-lg border border-white/10 px-4 py-2 font-black" onClick={captureKeyPoints}>AI key points</button>
              <button className="rounded-lg border border-red-400/40 px-4 py-2 font-black text-red-200" onClick={leaveClass}>End/Leave</button>
            </div>
            {status ? <p className="mt-3 text-sm text-slate-300">{status}</p> : null}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-xl font-black">Participants</h2>
            <div className="mt-3 grid gap-2">
              {participants.map((participant) => <div key={participant} className="rounded-lg bg-slate-950 px-3 py-2 text-sm">{participant} <span className="float-right text-emerald-300">present</span></div>)}
            </div>
          </section>

          {hasQuiz ? (
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-xl font-black">Live Quiz</h2>
              <p className="mt-2 text-sm text-slate-400">Quiz tools appear only when a teacher attached a quiz.</p>
              <div className="mt-3 flex gap-2">
                {user.roles.includes("teacher") ? <button className="rounded-lg bg-violet-600 px-4 py-2 font-black" onClick={startQuiz}>Start quiz</button> : null}
                <button className="rounded-lg border border-white/10 px-4 py-2 font-black" onClick={submitQuizAnswer}>Submit answer</button>
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-xl font-black">Chat</h2>
            <div className="mt-3 max-h-64 space-y-2 overflow-auto">
              {messages.map((message) => <p key={message.id} className="rounded-lg bg-slate-950 p-2 text-sm"><strong>{message.author}</strong>: {message.text}<span className="float-right text-xs text-slate-500">{message.at}</span></p>)}
            </div>
            <div className="mt-3 flex gap-2">
              <input className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950 p-3" value={chatText} onChange={(event) => setChatText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendMessage(); }} placeholder="Message class..." />
              <button className="rounded-lg bg-violet-600 px-4 py-2 font-black" onClick={sendMessage}>Send</button>
            </div>
          </section>

          {notes.length ? (
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-xl font-black">AI Key Points</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {notes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            </section>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function VideoTile({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="relative grid min-h-[250px] place-items-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-blue-900">
      {children}
      {!children ? <span className="font-black">{title}</span> : null}
      {children ? <span className="pointer-events-none absolute rounded-full bg-black/50 px-3 py-1 text-sm font-bold">{title}</span> : null}
    </div>
  );
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
