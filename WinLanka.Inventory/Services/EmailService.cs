using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Resend;
using WinLanka.Inventory.Services.Interface;

namespace WinLanka.Inventory.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IResend _resend;
        private readonly string _fromEmail;
        private readonly string _fromName;

        public EmailService(
            ILogger<EmailService> logger,
            IResend resend,
            IConfiguration configuration)
        {
            _logger = logger;
            _resend = resend;

            _fromEmail = configuration["ResendFromEmail"] ?? throw new InvalidOperationException("ResendFromEmail is not configured.");

            _fromName = configuration["ResendFromName"] ?? "WinLanka Apparel Inventory";
        }

        public async Task SendReorderLevelUpdatedEmailAsync(string recipientEmail, string stockName, int stockItemId, int oldReorderLevel, int newReorderLevel)
        {
            if (string.IsNullOrWhiteSpace(recipientEmail))
            {
                return;
            }

            var subject =
                $"Reorder Level Updated - {stockName}";

            var plainTextContent =
                $"""
                Hello,

                The reorder level for the following stock item has been updated.

                Stock Item ID: {stockItemId}
                Stock Name: {stockName}

                Previous Reorder Level: {oldReorderLevel}
                New Reorder Level: {newReorderLevel}

                Please review the stock levels in the WinLanka Apparel Inventory Management System.

                Regards,
                WinLanka Apparel Inventory Management
                """;

            var htmlContent =
                $"""
                <html>
                <body style="font-family: Arial, sans-serif; color: #333;">

                    <h2>Reorder Level Updated</h2>

                    <p>
                        The reorder level for the following stock item
                        has been updated.
                    </p>

                    <table
                        style="
                            border-collapse: collapse;
                            width: 100%;
                            max-width: 600px;
                        "
                    >
                        <tr>
                            <td
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    font-weight: bold;
                                "
                            >
                                Stock Item ID
                            </td>

                            <td
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                "
                            >
                                {stockItemId}
                            </td>
                        </tr>

                        <tr>
                            <td
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    font-weight: bold;
                                "
                            >
                                Stock Name
                            </td>

                            <td
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                "
                            >
                                {stockName}
                            </td>
                        </tr>

                        <tr>
                            <td
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    font-weight: bold;
                                "
                            >
                                Previous Reorder Level
                            </td>

                            <td
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                "
                            >
                                {oldReorderLevel}
                            </td>
                        </tr>

                        <tr>
                            <td
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    font-weight: bold;
                                "
                            >
                                New Reorder Level
                            </td>

                            <td
                                style="
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                "
                            >
                                {newReorderLevel}
                            </td>
                        </tr>
                    </table>

                    <p style="margin-top: 20px;">
                        Please review the stock levels in the
                        WinLanka Apparel Inventory Management System.
                    </p>

                    <p>
                        Regards,<br />
                        WinLanka Apparel Inventory Management
                    </p>

                </body>
                </html>
                """;

            var message = new EmailMessage
            {
                From = $"{_fromName} <{_fromEmail}>",
                Subject = subject,
                HtmlBody = htmlContent,
                TextBody = plainTextContent
            };

            message.To.Add(recipientEmail);

            try
            {
                var response = await _resend.EmailSendAsync(message);

                _logger.LogInformation( "Reorder level notification sent to {Email}.", recipientEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError( ex, "Resend failed to send email to {Email}.", recipientEmail);

                throw new InvalidOperationException( "Unable to send reorder level notification email.", ex);
            }
        }
    }
}

