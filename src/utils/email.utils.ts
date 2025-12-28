export async function sendEmail(to: string, subject: string, html: string) {
  // TODO: plug in nodemailer/resend here
  console.log("SEND EMAIL", {to, subject, html});
}