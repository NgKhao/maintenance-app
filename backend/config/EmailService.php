<?php
require_once __DIR__ . '/env.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private $mailer;

    public function __construct()
    {
        $this->mailer = new PHPMailer(true);
        $this->configure();
    }

    /**
     * Configure PHPMailer with environment variables
     */
    private function configure()
    {
        try {
            // Server settings
            $this->mailer->isSMTP();
            $this->mailer->Host = env('MAIL_HOST', 'smtp.gmail.com');
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = env('MAIL_USERNAME');
            $this->mailer->Password = env('MAIL_PASSWORD');
            $this->mailer->SMTPSecure = env('MAIL_ENCRYPTION', 'tls');
            $this->mailer->Port = env('MAIL_PORT', 587);
            $this->mailer->CharSet = 'UTF-8';

            // Default sender
            $this->mailer->setFrom(
                env('MAIL_FROM_EMAIL'),
                env('MAIL_FROM_NAME', 'Maintenance App')
            );

            // Debug mode (only in development)
            if (env('APP_DEBUG', false)) {
                $this->mailer->SMTPDebug = SMTP::DEBUG_OFF;
            }
        } catch (Exception $e) {
            error_log("Email configuration error: " . $e->getMessage());
        }
    }

    /**
     * Send maintenance schedule confirmation email to customer
     * 
     * @param array $scheduleData Schedule information
     * @return bool Success status
     */
    public function sendMaintenanceConfirmation($scheduleData)
    {
        try {
            // Reset recipients
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();

            // Add recipient
            $this->mailer->addAddress($scheduleData['user_email'], $scheduleData['user_name']);

            // Email subject
            $this->mailer->Subject = '✅ Xác nhận lịch bảo trì thiết bị - ' . $scheduleData['device_name'];

            // Email body (HTML)
            $this->mailer->isHTML(true);
            $this->mailer->Body = $this->getMaintenanceTemplate($scheduleData);

            // Alternative plain text
            $this->mailer->AltBody = $this->getPlainTextTemplate($scheduleData);

            // Send email
            $result = $this->mailer->send();

            if ($result) {
                error_log("Email sent successfully to: " . $scheduleData['user_email']);
            }

            return $result;
        } catch (Exception $e) {
            error_log("Email sending failed: " . $this->mailer->ErrorInfo);
            return false;
        }
    }

    /**
     * Get HTML email template for maintenance confirmation
     * 
     * @param array $data Schedule data
     * @return string HTML content
     */
    private function getMaintenanceTemplate($data)
    {
        $scheduledDate = date('d/m/Y', strtotime($data['scheduled_date']));
        $appName = env('APP_NAME', 'Maintenance App');

        return "
        <!DOCTYPE html>
        <html lang='vi'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                }
                .content {
                    padding: 30px;
                }
                .greeting {
                    font-size: 18px;
                    color: #333;
                    margin-bottom: 20px;
                }
                .info-box {
                    background-color: #f8f9fa;
                    border-left: 4px solid #667eea;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .info-row {
                    display: flex;
                    padding: 8px 0;
                    border-bottom: 1px solid #e9ecef;
                }
                .info-row:last-child {
                    border-bottom: none;
                }
                .info-label {
                    font-weight: 600;
                    color: #495057;
                    width: 150px;
                    flex-shrink: 0;
                }
                .info-value {
                    color: #212529;
                    flex: 1;
                }
                .highlight {
                    background-color: #d4edda;
                    color: #155724;
                    padding: 15px;
                    border-radius: 4px;
                    margin: 20px 0;
                    text-align: center;
                    font-weight: 600;
                }
                .note {
                    background-color: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .footer {
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: #6c757d;
                    border-top: 1px solid #dee2e6;
                }
                .contact-info {
                    margin-top: 15px;
                    font-size: 13px;
                }
                .icon {
                    display: inline-block;
                    margin-right: 5px;
                }
            </style>
        </head>
        <body>
            <div class='email-container'>
                <div class='header'>
                    <h1>🔧 {$appName}</h1>
                    <p style='margin: 10px 0 0 0; opacity: 0.9;'>Dịch vụ bảo trì thiết bị chuyên nghiệp</p>
                </div>
                
                <div class='content'>
                    <div class='greeting'>
                        Xin chào <strong>{$data['user_name']}</strong>,
                    </div>
                    
                    <p>Chúng tôi xin thông báo lịch bảo trì thiết bị của bạn đã được <strong style='color: #28a745;'>xác nhận</strong> bởi kỹ thuật viên.</p>
                    
                    <div class='highlight'>
                        ✅ Lịch bảo trì đã được xác nhận và sẽ được thực hiện đúng hẹn
                    </div>
                    
                    <div class='info-box'>
                        <h3 style='margin-top: 0; color: #667eea;'>📋 Thông tin chi tiết</h3>
                        
                        <div class='info-row'>
                            <span class='info-label'>📅 Ngày bảo trì:</span>
                            <span class='info-value'><strong>{$scheduledDate}</strong></span>
                        </div>
                        
                        <div class='info-row'>
                            <span class='info-label'>🔧 Thiết bị:</span>
                            <span class='info-value'>{$data['device_name']}</span>
                        </div>
                        
                        <div class='info-row'>
                            <span class='info-label'>🔢 Số Serial:</span>
                            <span class='info-value'>{$data['serial_number']}</span>
                        </div>
                        
                        <div class='info-row'>
                            <span class='info-label'>📦 Gói dịch vụ:</span>
                            <span class='info-value'>{$data['package_name']}</span>
                        </div>
                        
                        <div class='info-row'>
                            <span class='info-label'>👨‍🔧 Kỹ thuật viên:</span>
                            <span class='info-value'>{$data['technician_name']}</span>
                        </div>
                    </div>
                    
                    <div class='note'>
                        <strong>📌 Lưu ý quan trọng:</strong>
                        <ul style='margin: 10px 0 0 0; padding-left: 20px;'>
                            <li>Vui lòng đảm bảo có mặt tại địa chỉ vào ngày đã hẹn</li>
                            <li>Chuẩn bị sẵn thiết bị để kỹ thuật viên kiểm tra</li>
                            <li>Nếu cần thay đổi lịch, vui lòng liên hệ trước ít nhất 24h</li>
                        </ul>
                    </div>
                    
                    <p style='margin-top: 25px;'>
                        Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.
                    </p>
                    
                    <p style='margin-top: 20px;'>
                        Trân trọng,<br>
                        <strong>Đội ngũ {$appName}</strong>
                    </p>
                </div>
                
                <div class='footer'>
                    <p style='margin: 0;'>Email này được gửi tự động, vui lòng không trả lời.</p>
                    <div class='contact-info'>
                        <p style='margin: 5px 0;'>📞 Hotline: 1900-xxxx | 📧 Email: support@maintenanceapp.com</p>
                        <p style='margin: 5px 0;'>🌐 Website: www.maintenanceapp.com</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Get plain text version for email clients that don't support HTML
     * 
     * @param array $data Schedule data
     * @return string Plain text content
     */
    private function getPlainTextTemplate($data)
    {
        $scheduledDate = date('d/m/Y', strtotime($data['scheduled_date']));
        $appName = env('APP_NAME', 'Maintenance App');

        return "
{$appName} - Xác nhận lịch bảo trì

Xin chào {$data['user_name']},

Chúng tôi xin thông báo lịch bảo trì thiết bị của bạn đã được XÁC NHẬN bởi kỹ thuật viên.

THÔNG TIN CHI TIẾT:
---------------------
Ngày bảo trì: {$scheduledDate}
Thiết bị: {$data['device_name']}
Số Serial: {$data['serial_number']}
Gói dịch vụ: {$data['package_name']}
Kỹ thuật viên: {$data['technician_name']}

LƯU Ý QUAN TRỌNG:
- Vui lòng đảm bảo có mặt tại địa chỉ vào ngày đã hẹn
- Chuẩn bị sẵn thiết bị để kỹ thuật viên kiểm tra
- Nếu cần thay đổi lịch, vui lòng liên hệ trước ít nhất 24h

Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.

Trân trọng,
Đội ngũ {$appName}

---
Email này được gửi tự động, vui lòng không trả lời.
Hotline: 1900-xxxx | Email: support@maintenanceapp.com
        ";
    }

    /**
     * Send test email to verify configuration
     * 
     * @param string $toEmail Recipient email
     * @return bool Success status
     */
    public function sendTestEmail($toEmail)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($toEmail);
            $this->mailer->Subject = 'Test Email - Maintenance App';
            $this->mailer->Body = '<h1>Email configuration is working!</h1><p>Your SMTP settings are correct.</p>';
            $this->mailer->AltBody = 'Email configuration is working! Your SMTP settings are correct.';

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Test email failed: " . $this->mailer->ErrorInfo);
            return false;
        }
    }
}