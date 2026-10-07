<?php
// Webster (AI assistant) proxy: keeps the DeepAI key on the server and caps spending.
define('GRH_APP', true);
require __DIR__ . '/private/bootstrap.php';

$cfg = grh_config();
$enabled = trim((string)$cfg['deepai_key']) !== '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    grh_json(['enabled' => $enabled]);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') grh_json(['error' => 'Method not allowed.'], 405);
if (!$enabled) grh_json(['error' => 'Webster is switched off right now. You can still send your request below.'], 503);
if (!grh_same_origin()) grh_json(['error' => 'Request blocked.'], 403);

$busy = 'Webster has answered a lot of questions today. Please send your request below or call or text 740-319-2431.';
if (!grh_rate_ok('chat-ip', grh_client_key(), (int)$cfg['chat_per_ip_day'], 86400)) {
    grh_json(['error' => 'That’s the limit for Webster today. Send your request below and Cody will take it from here.'], 429);
}
if (!grh_rate_ok('chat-site', 'all', (int)$cfg['chat_site_day'], 86400)) {
    grh_json(['error' => $busy], 429);
}

$history = json_decode((string)($_POST['history'] ?? '[]'), true);
if (!is_array($history) || !$history) grh_json(['error' => 'Say a little about what you need first.'], 422);
// Keep the opening message (it carries the instructions) plus the most recent turns
if (count($history) > 24) $history = array_merge([$history[0]], array_slice($history, -23));
$topic = grh_clean_line((string)($_POST['topic'] ?? ''), 60);

$system = "You are Webster, the friendly AI assistant on the GRH Web Solutions website. GRH Web Solutions is run by Cody in Erie, PA. "
    . "If asked your name, you are Webster. Remember everything the visitor already told you earlier in this conversation and never start over or re-ask it. "
    . "Services: custom website design and development (mobile-first, SEO foundation, e-commerce and booking, most sites launch in under two weeks), "
    . "website redesigns and fixes, social media management (content, posting, engagement, monthly reports on Instagram, Facebook, TikTok, X, LinkedIn), "
    . "social media ads and marketing, AI chatbots and business automations (lead follow-up, CRM, email and calendar integrations), "
    . "and 1-on-1 DeFi and crypto education (educational only, never financial advice). "
    . "Your job is to help the visitor figure out which service fits and what details Cody needs: their business, goal, timeline, and what they have today. "
    . "Ask one short question at a time. Keep every reply under 70 words. Never quote prices or promise dates; say Cody will give a custom quote. "
    . "If asked about anything unrelated, politely steer back. "
    . "Once you understand what they need, ask for their name and the best phone number or email for Cody to reach them. "
    . "Then tell them to tap the Send this chat to Cody button below the chat, which sends Cody the whole conversation. They can also call or text Cody at 740-319-2431.";
if ($topic !== '') $system .= " The visitor picked the topic: {$topic}.";

$messages = [];
foreach ($history as $m) {
    if (!is_array($m)) continue;
    $role = ($m['role'] ?? '') === 'assistant' ? 'assistant' : 'user';
    $text = grh_clean_text((string)($m['content'] ?? ''), 500);
    if ($text !== '') $messages[] = ['role' => $role, 'content' => $text];
}
if (!$messages || $messages[0]['role'] !== 'user') grh_json(['error' => 'Say a little about what you need first.'], 422);
// The chat API takes no system role, so the instructions ride on the first visitor message
$messages[0]['content'] = "[Instructions for you, not from the visitor: {$system}]\n\nVisitor: " . $messages[0]['content'];

$ch = curl_init($cfg['deepai_endpoint']);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => ['chat_style' => 'chat', 'chatHistory' => json_encode($messages)],
    CURLOPT_HTTPHEADER => ['api-key: ' . $cfg['deepai_key']],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 8,
]);
$raw = curl_exec($ch);
$code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// The chat endpoint answers in plain text; tolerate a JSON {"output": ...} body too
$reply = (string)$raw;
$data = json_decode($reply, true);
if (is_array($data)) $reply = (string)($data['output'] ?? '');
$reply = trim($reply);

if ($code !== 200 || $reply === '') {
    error_log('GRH chat: DeepAI HTTP ' . $code . ' ' . substr((string)$raw, 0, 300));
    grh_json(['error' => 'Webster is unavailable right now. Please use the quick form below, or call or text 740-319-2431.'], 502);
}
grh_json(['reply' => mb_substr($reply, 0, 1200)]);
