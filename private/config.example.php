<?php
// Copy this file to config.php (same folder) on the server and fill in the values.
// config.php is never committed to GitHub and this folder is blocked from the web by .htaccess.
if (!defined('GRH_APP')) { http_response_code(404); exit; }

return [
    // Where quote requests are emailed
    'mail_to'   => 'cody@grhwebsolutions.com',
    // Sender address for those emails. Must be a mailbox on this domain or Hostinger may drop it.
    'mail_from' => 'cody@grhwebsolutions.com',

    // Max quote submissions per visitor (IP) per hour
    'contact_per_hour' => 5,

    // ── Optional AI assistant "Webster" (DeepAI) ──
    // Paste your DeepAI API key between the quotes to switch the chat on. Leave empty to hide it.
    'deepai_key'      => '',
    'deepai_endpoint' => 'https://api.deepai.org/hacking_is_a_serious_crime',
    // Spending guards: replies per visitor per day, and replies across the whole site per day
    'chat_per_ip_day' => 20,
    'chat_site_day'   => 40,
];
