<?php
// Quote form handler: validates the hero form and emails it to Cody.
define('GRH_APP', true);
require __DIR__ . '/private/bootstrap.php';

$json = grh_wants_json();

function finish(bool $ok, string $error = '', int $code = 200): void {
    global $json;
    if ($json) grh_json($ok ? ['ok' => true] : ['ok' => false, 'error' => $error], $code);
    header('Location: ' . ($ok ? 'thanks.html' : 'index.html?error=1#quote'), true, 303);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html#quote', true, 303);
    exit;
}
if (!grh_same_origin()) finish(false, 'Request blocked.', 403);

// Honeypot: real people never see or fill this field. Pretend it worked so bots move on.
if (!empty($_POST['website'])) finish(true);

$cfg = grh_config();
if (!grh_rate_ok('contact', grh_client_key(), (int)$cfg['contact_per_hour'], 3600)) {
    finish(false, 'You have sent a few requests already. Please call or text 740-319-2431 instead.', 429);
}

$name    = grh_clean_line((string)($_POST['name'] ?? ''), 80);
$email   = grh_clean_line((string)($_POST['email'] ?? ''), 120);
$phone   = grh_clean_line((string)($_POST['phone'] ?? ''), 30);
$topic   = grh_clean_line((string)($_POST['topic'] ?? ''), 60);
$detail  = grh_clean_line((string)($_POST['detail'] ?? ''), 80);
$message = grh_clean_text((string)($_POST['message'] ?? ''), 2000);
$chat    = grh_clean_text((string)($_POST['chat'] ?? ''), 6000);

$topics = ['New website', 'Website redesign or fix', 'Social media management', 'Social media ads and marketing',
           'AI automation or chatbot', 'DeFi education', 'Something else'];

$fromChat = $chat !== '';
if ($fromChat) {
    // Sent straight from Webster (the AI assistant): the conversation carries the context and
    // usually the visitor's contact details, so the form fields are optional.
    if ($name === '') $name = 'Website visitor (AI chat)';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $email = '';
} elseif ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($message) < 5) {
    finish(false, 'Please fill in your name, a valid email and a short message.', 422);
}
if (!in_array($topic, $topics, true)) $topic = $fromChat ? 'AI chat' : 'Something else';

// Link-stuffed messages are almost always spam
if (preg_match_all('#https?://#i', $message . ' ' . $chat) > 3) finish(true);

$subject = $fromChat
    ? 'New Webster chat lead' . ($topic !== 'AI chat' ? ': ' . $topic : '') . ($name !== 'Website visitor (AI chat)' ? ' from ' . $name : '')
    : 'New quote request: ' . $topic . ' from ' . $name;
$lines = [
    "New request from grhwebsolutions.com",
    "",
    "Name:    $name",
    "Email:   " . ($email !== '' ? $email : '(not given, check the chat below)'),
    "Phone:   " . ($phone !== '' ? $phone : '(not given)'),
    "Topic:   $topic" . ($detail !== '' ? " / $detail" : ''),
    "",
];
if ($message !== '') {
    $lines[] = "What they need:";
    $lines[] = $message;
}
if ($chat !== '') {
    $lines[] = "";
    $lines[] = "Full conversation with Webster:";
    $lines[] = $chat;
}
$lines[] = "";
$lines[] = "Sent " . date('Y-m-d H:i T') . ($email !== '' ? " · reply to this email to answer them directly." : '');
$body = implode("\n", $lines);

$from = $cfg['mail_from'];
$headers = [
    'From: GRH Website <' . $from . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: GRH-Web-Form',
];
if ($email !== '') $headers[] = 'Reply-To: ' . str_replace(['"', '<', '>'], '', $name) . ' <' . $email . '>';
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = @mail($cfg['mail_to'], $encodedSubject, $body, implode("\r\n", $headers), '-f' . $from);

// Keep a private backup copy so a lead is never lost if email has a bad day
$log = grh_data_dir() . '/leads.csv.php';
$new = !is_file($log);
if ($fh = @fopen($log, 'a')) {
    if ($new) fwrite($fh, "<?php exit; ?>\n");
    fputcsv($fh, [date('c'), $sent ? 'emailed' : 'EMAIL FAILED', $name, $email, $phone, $topic, $detail, $message, $chat]);
    fclose($fh);
}

if (!$sent) {
    finish(false, 'Your message was saved, but email had a hiccup. To be safe, please also call or text 740-319-2431.', 500);
}
finish(true);
