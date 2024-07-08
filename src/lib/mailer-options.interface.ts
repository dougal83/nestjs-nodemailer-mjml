import { Provider } from '@nestjs/common';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { IPluginOptions } from 'nodemailer-mjml';
import { Options } from 'nodemailer/lib/mailer';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface MailerModuleOptions {
  transport: SMTPTransport | SMTPTransport.Options | string;
  mjmlPluginOptions?: IPluginOptions;
  defaults?: Options;
}

export interface MailerOptionsFactory {
  createMailerModuleOptions():
    | Promise<MailerModuleOptions>
    | MailerModuleOptions;
}

export interface MailerModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<MailerOptionsFactory>;
  useExisting?: Type<MailerOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MailerModuleOptions> | MailerModuleOptions;
  extraProviders?: Provider[];
}
