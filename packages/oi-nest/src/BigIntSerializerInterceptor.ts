import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const JSONBig = require('json-bigint')

@Injectable()
export class BigIntSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const jsonBigInt = JSONBig({ useNativeBigInt: true });
        const serialized = jsonBigInt.stringify(data);
        return JSON.parse(serialized);
      }),
    );
  }
}
