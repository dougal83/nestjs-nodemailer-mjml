import { DynamicModule, Module } from '@nestjs/common';
import { MailerCoreModule } from './mailer-core.module';
import {
  MailerModuleAsyncOptions,
  MailerModuleOptions,
} from './mailer-options.interface';

@Module({})
export class MailerModule {
  static forRoot(options?: MailerModuleOptions): DynamicModule {
    return {
      module: MailerModule,
      imports: [MailerCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: MailerModuleAsyncOptions): DynamicModule {
    return {
      module: MailerModule,
      imports: [MailerCoreModule.forRootAsync(options)],
    };
  }
}
