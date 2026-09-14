import {
  extensionForMediaMessage,
  extractMessageContent,
  jidNormalizedUser,
  getContentType,
  proto,
  downloadContentFromMessage,
} from "@whiskeysockets/baileys";
import fs from "fs";
import { fileTypeFromBuffer } from "file-type";
import { getRandom } from "./Function.js";

export const downloadMediaMessage = async (message, fileName) => {
  if (!message) return null;
  const msg = message.msg ? message.msg : message;
  const mimetype = msg?.mimetype || "";
  let mtype = "image";

  if (/image/.test(mimetype)) mtype = "image";
  else if (/video/.test(mimetype)) mtype = "video";
  else if (/audio/.test(mimetype)) mtype = "audio";
  else if (/sticker|webp/.test(mimetype)) mtype = "sticker";
  else if (/document|pdf/.test(mimetype)) mtype = "document";
  else if (message.type) mtype = message.type.replace(/Message/gi, "").toLowerCase();

  try {
    const stream = await downloadContentFromMessage(msg, mtype);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    if (fileName) {
      let ftype = await fileTypeFromBuffer(buffer);
      let ext = ftype?.ext || mimetype.split("/")[1] || "bin";
      let trueFileName = fileName.includes(".") ? fileName : `${fileName}.${ext}`;
      await fs.promises.writeFile(trueFileName, buffer);
      return trueFileName;
    }
    return buffer;
  } catch (err) {
    throw new Error(`Media download error: ${err.message}`);
  }
};

class WAConnection {
  constructor(client) {
    for (let v in client) {
      this[v] = client[v];
    }
  }

  async serializeM(m) {
    return serialize(this, m);
  }

  parseMention(text = "") {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
      (v) => v[1] + "@s.whatsapp.net"
    );
  }

  async downloadMediaMessage(message, fileName) {
    return downloadMediaMessage(message, fileName);
  }
}

export { WAConnection };

export const serialize = (client, m) => {
  if (!m) return m;
  let M = proto.WebMessageInfo;
  m = M.create(m);

  if (m.key) {
    m.from = jidNormalizedUser(m.key.remoteJid || m.key.participant || "");
    m.fromMe = m.key.fromMe;
    m.id = m.key.id;
    m.isBot = m.id.startsWith("BAE5") && m.id.length === 16;
    m.isGroup = m.from.endsWith("@g.us");
    m.sender = jidNormalizedUser(
      (m.fromMe && client.user?.id) || m.key.participant || m.from || ""
    );
  }

  if (m.message) {
    m.message = extractMessageContent(m.message);
    m.type = getContentType(m.message);
    m.msg = m.message?.[m.type];
    m.mentionedJid =
      m.msg?.contextInfo?.mentionedJid ||
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
      m.message?.[m.type]?.contextInfo?.mentionedJid ||
      [];
    m.mentions = m.mentionedJid;
    m.quoted = m.msg?.contextInfo?.quotedMessage ? extractMessageContent(m.msg.contextInfo.quotedMessage) : null;

    if (m.quoted) {
      m.quoted.type = getContentType(m.quoted);
      m.quoted.msg = m.quoted[m.quoted.type];
      m.quoted.mentionedJid =
        m.quoted.msg?.contextInfo?.mentionedJid ||
        m.msg?.contextInfo?.mentionedJid ||
        [];
      m.quoted.mentions = m.quoted.mentionedJid;
      m.quoted.id = m.msg?.contextInfo?.stanzaId;
      m.quoted.sender = jidNormalizedUser(
        m.msg?.contextInfo?.participant || m.sender
      );
      m.quoted.from = m.from;
      m.quoted.isGroup = m.quoted.from.endsWith("@g.us");
      m.quoted.fromMe = m.quoted.sender === jidNormalizedUser(client.user?.id || "");
      m.quoted.text =
        m.quoted.msg?.text ||
        m.quoted.msg?.caption ||
        m.quoted.msg?.conversation ||
        m.quoted.msg?.contentText ||
        m.quoted.msg?.selectedDisplayText ||
        "";
      m.quoted.download = (pathFile) => downloadMediaMessage(m.quoted.msg || m.quoted, pathFile);
    }
  }

  m.body = m.text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.[m.type]?.text ||
    m.message?.[m.type]?.caption ||
    m.message?.[m.type]?.contentText ||
    m.message?.[m.type]?.selectedDisplayText ||
    "";

  m.download = (pathFile) => downloadMediaMessage(m.msg || m.message, pathFile);

  m.reply = (text, chatId = m.from, options = {}) => {
    if (typeof chatId === "object" && chatId !== null) {
      options = chatId;
      chatId = m.from;
    }
    if (Buffer.isBuffer(text)) {
      return client.sendMessage(
        chatId,
        { document: text, mimetype: "application/octet-stream", ...options },
        { quoted: m }
      );
    }
    const strText = String(text);
    const textMentions = [...strText.matchAll(/@([0-9]{5,16})/g)].map(
      (v) => v[1] + "@s.whatsapp.net"
    );
    const mergedMentions = Array.from(
      new Set([...(options.mentions || []), ...textMentions])
    );
    return client.sendMessage(
      chatId,
      {
        text: strText,
        ...options,
        ...(mergedMentions.length > 0 ? { mentions: mergedMentions } : {}),
      },
      { quoted: m }
    );
  };

  return m;
};
