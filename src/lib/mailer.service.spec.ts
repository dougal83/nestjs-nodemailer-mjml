import { Test, TestingModule } from '@nestjs/testing';
import MailMessage from 'nodemailer/lib/mailer/mail-message';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { MailerModuleOptions } from './mailer-options.interface';
import { MAILER_MODULE_OPTIONS } from './mailer.constants';
import { MailerService } from './mailer.service';

async function getMailerServiceWithOptions(
  options: MailerModuleOptions | object
): Promise<MailerService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: MAILER_MODULE_OPTIONS,
        useValue: options,
      },
      MailerService,
    ],
  }).compile();

  return module.get<MailerService>(MailerService);
}

function spyOnSmtpSend(onMail: (mail: MailMessage) => void) {
  return vi
    .spyOn(SMTPTransport.prototype, 'send')
    .mockImplementation(function (
      mail: MailMessage,
      callback: (err: Error | null, info: SMTPTransport.SentMessageInfo) => void
    ): void {
      onMail(mail);
      callback(null, {
        envelope: {
          from: mail.data.from as string,
          to: [mail.data.to as string],
        },
        messageId: 'abc',
        accepted: [],
        rejected: [],
        pending: [],
        response: 'ok',
      });
    });
}
describe('mailerService', () => {
  it('should not be defined if transport is not provided', async () => {
    await expect(getMailerServiceWithOptions({})).rejects.toMatchInlineSnapshot(
      `[Error: Make sure to provide a nodemailer transport connection string, configuration object or instance.]`
    );
  });

  it('should accept smtp transport string', async () => {
    const service = await getMailerServiceWithOptions({
      transport: 'smtps://user:pass@smtp.domain.com',
    });

    expect(service).toBeDefined();
    expect((service as any).transport.transporter).toBeInstanceOf(
      SMTPTransport
    );
  });

  it('should accept smtp transport options', async () => {
    const service = await getMailerServiceWithOptions({
      transport: {
        secure: true,
        auth: {
          user: 'user',
          pass: 'pass',
        },
        options: {
          host: 'smtp.domain.com',
        },
      },
    });

    expect(service).toBeDefined();
    expect((service as any).transport.transporter).toBeInstanceOf(
      SMTPTransport
    );
  });

  it('should accept smtp transport instance', async () => {
    const transport = new SMTPTransport({});
    const service = await getMailerServiceWithOptions({
      transport: transport,
    });

    expect(service).toBeDefined();
    expect((service as any).transport.transporter).toBe(transport);
  });

  it('should send emails via nodemailer', async () => {
    let sentMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      sentMail = mail;
    });

    const service = await getMailerServiceWithOptions({
      transport: 'smtps://user:pass@smtp.domain.com',
    });

    await service.sendMail({
      from: 'user1@example.com',
      to: 'user2@example.com',
      subject: 'Test',
      html: 'Lorem ipsum...',
    });

    expect(send).toHaveBeenCalled();
    expect(sentMail.data.from).toBe('user1@example.com');
    expect(sentMail.data.to).toBe('user2@example.com');
    expect(sentMail.data.subject).toBe('Test');
    expect(sentMail.data.html).toBe('Lorem ipsum...');
  });

  it('should use/override MailerModuleOptions.defaults', async () => {
    let sentMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      sentMail = mail;
    });

    const service = await getMailerServiceWithOptions({
      transport: 'smtps://user:pass@smtp.domain.com',
      defaults: {
        from: 'user1@example.com',
        subject: 'Example',
      },
    });

    await service.sendMail({
      to: 'user2@example.com',
      subject: 'Overridden',
      html: 'Lorem ipsum...',
    });

    expect(send).toHaveBeenCalled();
    expect(sentMail.data.from).toBe('user1@example.com');
    expect(sentMail.data.subject).toBe('Overridden');
  });
});
