import { Inject, Injectable, Logger } from '@nestjs/common';
import { deepmerge } from 'deepmerge-ts';
import { SentMessageInfo, Transporter, createTransport } from 'nodemailer';
import { nodemailerMjmlPlugin } from 'nodemailer-mjml';
import { Options } from 'nodemailer/lib/mailer';

import { MailerModuleOptions } from './mailer-options.interface';
import { MAILER_MODULE_OPTIONS } from './mailer.constants';

@Injectable()
export class MailerService {
  private readonly logger = new Logger('MailerService');
  private transport: Transporter;
  private defaults: Options;

  constructor(
    @Inject(MAILER_MODULE_OPTIONS) private readonly options: MailerModuleOptions
  ) {
    if (!options.transport)
      throw new Error(
        'Make sure to provide a nodemailer transport connection string, configuration object or instance.'
      );
    this.transport = createTransport(this.options.transport);
    this.transport.use(
      'compile',
      nodemailerMjmlPlugin(this.options.mjmlPluginOptions)
    );
    this.defaults = this.options.defaults;
  }

  public async sendMail(options: Options): Promise<SentMessageInfo> {
    const merged = deepmerge(this.defaults, options);
    try {
      return await this.transport.sendMail(merged);
    } catch (e) {
      this.logger.error(e?.message);
    }
  }
}
