<?php

/**
 * Environment Configuration Loader
 * Loads environment variables from .env file
 */

class EnvLoader
{
    public static function load($path)
    {
        if (!file_exists($path)) {
            throw new Exception(".env file not found at: $path");
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) {
                continue; // Skip comments
            }

            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);

                // Remove quotes if present
                if (preg_match('/^"(.*)"$/', $value, $matches)) {
                    $value = $matches[1];
                } elseif (preg_match('/^\'(.*)\'$/', $value, $matches)) {
                    $value = $matches[1];
                }

                if (!array_key_exists($key, $_ENV)) {
                    $_ENV[$key] = $value;
                    putenv("$key=$value");
                }
            }
        }
    }
}

/**
 * Get environment variable with optional default value
 */
function env($key, $default = null)
{
    $value = $_ENV[$key] ?? getenv($key) ?? $default;

    // Convert string boolean values
    if (is_string($value)) {
        switch (strtolower($value)) {
            case 'true':
            case '(true)':
                return true;
            case 'false':
            case '(false)':
                return false;
            case 'null':
            case '(null)':
                return null;
        }
    }

    return $value;
}

// Load environment variables
$envPath = __DIR__ . '/../.env';
try {
    EnvLoader::load($envPath);
} catch (Exception $e) {
    // Handle error gracefully in production
    if (env('APP_ENV', 'production') === 'development') {
        throw $e;
    }
}
