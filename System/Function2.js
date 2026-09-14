import { proto, getContentType } from "@whiskeysockets/baileys";
import axios from "axios";
import util from "util";

export const bytesToSize = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const getSizeMedia = async (path) => {
  return new Promise((resolve) => {
    if (typeof path === "string" && /^https?:\/\//.test(path)) {
      axios.head(path).then((res) => {
        let length = parseInt(res.headers["content-length"] || "0");
        resolve(bytesToSize(length));
      }).catch(() => resolve("Unknown"));
    } else if (Buffer.isBuffer(path)) {
      resolve(bytesToSize(Buffer.byteLength(path)));
    } else {
      resolve("Unknown");
    }
  });
};

export const parseMention = (text = "") => {
  return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
    (v) => v[1] + "@s.whatsapp.net"
  );
};

export const smsg = (conn, m) => {
  if (!m) return m;
  let M = proto.WebMessageInfo;
  if (m.key) {
    m.id = m.key.id;
    m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith("@g.us");
    m.sender = conn.decodeJid
      ? conn.decodeJid(
          (m.fromMe && conn.user?.id) ||
            m.participant ||
            m.key.participant ||
            m.chat ||
            ""
        )
      : (m.fromMe && conn.user?.id) || m.participant || m.key.participant || m.chat || "";
  }
  if (m.message) {
    m.mtype = getContentType(m.message);
    m.msg =
      m.mtype === "viewOnceMessage"
        ? m.message[m.mtype]?.message?.[getContentType(m.message[m.mtype]?.message)]
        : m.message[m.mtype];
    m.body =
      m.message.conversation ||
      m.msg?.caption ||
      m.msg?.text ||
      (m.mtype === "listResponseMessage" && m.msg?.singleSelectReply?.selectedRowId) ||
      (m.mtype === "buttonsResponseMessage" && m.msg?.selectedButtonId) ||
      "";
    let quoted = (m.quoted = m.msg?.contextInfo ? m.msg.contextInfo.quotedMessage : null);
    m.mentionedJid = m.msg?.contextInfo ? m.msg.contextInfo.mentionedJid || [] : [];
    if (m.quoted) {
      let type = getContentType(quoted);
      m.quoted = m.quoted[type] || m.quoted;
      m.quoted.mtype = type;
      m.quoted.id = m.msg.contextInfo.stanzaId;
      m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
      m.quoted.sender = conn.decodeJid
        ? conn.decodeJid(m.msg.contextInfo.participant)
        : m.msg.contextInfo.participant;
      m.quoted.fromMe = m.quoted.sender === (conn.user && conn.user.id);
      m.quoted.text =
        m.quoted.text ||
        m.quoted.caption ||
        m.quoted.conversation ||
        "";
      m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid || [] : [];
    }
  }
  m.text =
    m.msg?.text ||
    m.msg?.caption ||
    m.message?.conversation ||
    m.body ||
    "";

  m.reply = (text, chatId = m.chat, options = {}) =>
    Buffer.isBuffer(text)
      ? conn.sendMessage(chatId, { document: text, mimetype: "application/octet-stream" }, { quoted: m, ...options })
      : conn.sendMessage(chatId, { text: String(text) }, { quoted: m, ...options });

  return m;
};
