<?php
// Shared helpers for contact.php and chat.php
if (!defined('GRH_APP')) { http_response_code(404); exit; }
date_default_timezone_set('America/New_York');

function grh_config(): array {
    static $cfg = null;
    if ($cfg !== null) return $cfg;
    $defaults = [
        'mail_to' => 'cody@grhwebsolutions.com',
        'mail_from' => 'cody@grhwebsolutions.com',
        'contact_per_hour' => 5,
        'deepai_key' => '',
        'deepai_endpoint' => 'https://api.deepai.org/hacking_is_a_serious_crime',
        'chat_per_ip_day' => 20,
        'chat_site_day' => 40,
    ];
    $file = __DIR__ . '/config.php';
    $user = is_file($file) ? (include $file) : [];
    $cfg = array_merge($defaults, is_array($user) ? $user : []);
    return $cfg;
}

function grh_data_dir(): string {
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) @mkdir($dir, 0750, true);
    return $dir;
}

function grh_wants_json(): bool {
    return stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;
}

function grh_json(array $payload, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload);
    exit;
}

// Reject cross-site posts (another site's form or script posting to ours)
function grh_same_origin(): bool {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') return true; // older browsers and no-JS posts omit it
    $host = parse_url($origin, PHP_URL_HOST);
    $self = preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? '');
    return $host !== null && strcasecmp($host, $self) === 0;
}

function grh_client_key(): string {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return substr(hash('sha256', 'grh|' . $ip), 0, 24);
}

/**
 * Counts hits per key within a window. Returns false once the limit is reached.
 * $bucket names the counter file, e.g. "contact" or "chat".
 */
function grh_rate_ok(string $bucket, string $key, int $limit, int $window): bool {
    $file = grh_data_dir() . '/rate-' . preg_replace('/[^a-z0-9-]/', '', $bucket) . '.json';
    $fh = @fopen($file, 'c+');
    if (!$fh) return true; // fail open rather than block real customers
    flock($fh, LOCK_EX);
    $raw = stream_get_contents($fh);
    $data = json_decode($raw ?: '{}', true) ?: [];
    $now = time();
    foreach ($data as $k => $hits) {
        $data[$k] = array_values(array_filter($hits, fn($t) => $t > $now - $window));
        if (!$data[$k]) unset($data[$k]);
    }
    $hits = $data[$key] ?? [];
    $ok = count($hits) < $limit;
    if ($ok) { $hits[] = $now; $data[$key] = $hits; }
    ftruncate($fh, 0); rewind($fh);
    fwrite($fh, json_encode($data));
    flock($fh, LOCK_UN); fclose($fh);
    return $ok;
}

function grh_clean_line(string $s, int $max): string {
    $s = preg_replace('/[\r\n\t]+/', ' ', $s);
    $s = preg_replace('/[\x00-\x1F\x7F]/u', '', $s);
    return mb_substr(trim($s), 0, $max);
}

function grh_clean_text(string $s, int $max): string {
    $s = str_replace("\r\n", "\n", $s);
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s);
    return mb_substr(trim($s), 0, $max);
}
