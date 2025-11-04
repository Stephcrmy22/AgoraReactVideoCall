import {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import { useState } from "react";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";

// ✅ Load .env variables
const DEFAULT_APP_ID = import.meta.env.VITE_AGORA_APP_ID || "";
const DEFAULT_CHANNEL = import.meta.env.VITE_AGORA_CHANNEL || "";
const DEFAULT_TOKEN = import.meta.env.VITE_AGORA_TOKEN || "";

// ✅ Create Agora client once
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export const VideoCalling = () => {
  return (
    <>
      <AgoraRTCProvider client={client}>
        <Basics />
      </AgoraRTCProvider>

      {/* Embedded Styles */}
      <style>{`
        html, body, #root {
          height: 100%;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #0B0C10 0%, #001F3F 100%);
          font-family: "Inter", sans-serif;
          overflow: hidden;
        }
        .app-container {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          color: white;
          text-align: center;
        }
        .video-wrapper {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 20px;
          width: 100%;
          max-width: 1400px;
          padding: 20px;
        }
        .video-card {
          position: relative;
          width: 450px;
          height: 400px;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(18px);
          border: 1px solid #099DFD;
          box-shadow: 0 0 25px rgba(9, 157, 253, 0.2);
          transition: transform 0.3s ease;
        }
        .video-card:hover {
          transform: scale(1.03);
          box-shadow: 0 0 30px rgba(9, 157, 253, 0.4);
        }
        .overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(9, 157, 253, 0.25);
          backdrop-filter: blur(6px);
          color: white;
          padding: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .video-card:hover .overlay {
          opacity: 1;
        }
        .join-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(18px);
          border: 1px solid #099DFD;
          border-radius: 20px;
        }
        .join-panel h2 {
          color: #099DFD;
          margin-bottom: 10px;
        }
        .join-panel input {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          padding: 10px;
          border: 1px solid rgba(9, 157, 253, 0.4);
          border-radius: 8px;
        }
        .join-panel button {
          background: #099DFD;
          color: white;
          padding: 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .join-panel button:hover {
          background: #0584d5;
        }
        .glass-controls {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(9, 157, 253, 0.5);
          padding: 10px 20px;
          border-radius: 40px;
          display: flex;
          gap: 15px;
        }
        .glass-button {
          background: rgba(9, 157, 253, 0.15);
          border: 1px solid rgba(9, 157, 253, 0.5);
          padding: 8px 14px;
          border-radius: 25px;
          color: white;
          cursor: pointer;
          transition: background 0.3s;
        }
        .glass-button:hover {
          background: rgba(9, 157, 253, 0.35);
        }
        .leave-button {
          background: rgba(255, 75, 75, 0.25);
          border: 1px solid rgba(255, 75, 75, 0.5);
        }
        .leave-button:hover {
          background: rgba(255, 75, 75, 0.4);
        }
      `}</style>
    </>
  );
};

const Basics = () => {
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();

  // ✅ Default values from .env (can be overridden)
  const [appId, setAppId] = useState(DEFAULT_APP_ID);
  const [channel, setChannel] = useState(DEFAULT_CHANNEL);
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [uid, setUid] = useState(""); // 👈 Manual UID input
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);

  // ✅ Local tracks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);

  // ✅ Convert UID input to number (required by Agora)
  const userUid = uid ? parseInt(uid) : Math.floor(Math.random() * 1000000);

  // ✅ Join & publish
  useJoin({ appid: appId, channel, token: token || null, uid: userUid }, calling);
  usePublish([localMicrophoneTrack, localCameraTrack]);
  const remoteUsers = useRemoteUsers();

  return (
    <div className="app-container">
      {isConnected ? (
        <div className="video-wrapper">
          {/* Local User */}
          <div className="video-card">
            <LocalUser
              audioTrack={localMicrophoneTrack}
              cameraOn={cameraOn}
              micOn={micOn}
              playAudio={false}
              videoTrack={localCameraTrack}
            />
            <div className="overlay">
              <span>You (UID: {userUid})</span>
            </div>
          </div>

          {/* Remote Users */}
          {remoteUsers.map((user) => (
            <div key={user.uid} className="video-card">
              <RemoteUser user={user} />
              <div className="overlay">
                <span>UID: {user.uid}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="join-panel">
          <h2>Join a Channel</h2>
          <input
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            placeholder="App ID"
          />
          <input
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            placeholder="Channel"
          />
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token"
          />
          <input
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="UID (optional)"
          />
          <button onClick={() => setCalling(true)}>Join Channel</button>
        </div>
      )}

      {isConnected && (
        <div className="glass-controls">
          <button onClick={() => setMic((a) => !a)} className="glass-button">
            {micOn ? "🎤 Mic On" : "🔇 Mic Off"}
          </button>
          <button onClick={() => setCamera((a) => !a)} className="glass-button">
            {cameraOn ? "📸 Cam On" : "🚫 Cam Off"}
          </button>
          <button
            onClick={() => setCalling((a) => !a)}
            className="glass-button leave-button"
          >
            {calling ? "❌ Leave" : "📞 Join"}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCalling;
