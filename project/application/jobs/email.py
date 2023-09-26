import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication


SMTP_SERVER_HOST="localhost"
SMTP_SERVER_PORT=1025
SENDER_ADDRESS='ticketbooking@yahoo.com'
SENDER_PASSWORD=''

def send_email(to,sub,message,file=None):
    msg=MIMEMultipart()
    msg['From']=SENDER_ADDRESS
    msg['To']=to
    msg['Subject']=sub
    
    msg.attach(MIMEText(message,"html"))

    if not file==None:
        with open(file, 'rb') as f:
            attach = MIMEApplication(f.read(), _subtype='zip')
            attach.add_header('Content-Disposition', 'attachment', filename=file)
            msg.attach(attach)
    
    s=smtplib.SMTP(host=SMTP_SERVER_HOST,port=SMTP_SERVER_PORT)
    s.login(SENDER_ADDRESS,SENDER_PASSWORD)
    s.send_message(msg)
    s.quit()
    return True