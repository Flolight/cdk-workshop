import cdk = require('@aws-cdk/core');
import * as lambda from '@aws-cdk/aws-lambda';
import { HitCounter } from '../lib/hitcounter';
import { expect as expectCDK, haveResource } from '@aws-cdk/assert';

test('DynamoDB Table Created', () => {
    const stack = new cdk.Stack();

    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromInline('test')
        })
    });

    expectCDK(stack).to(haveResource('AWS::DynamoDB::Table'));
});

test('Lambda Has Env Variables', () => {
    const stack = new cdk.Stack();

    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromInline('test')
        })
    });

    expectCDK(stack).to(haveResource('AWS::Lambda::Function', {
        Environment: {
            Variables: {
                DOWNSTREAM_FUNCTION_NAME: {
                    Ref: "TestFunction22AD90FC",
                },
                  HITS_TABLE_NAME: {
                    Ref: "MyTestConstructHits24A357F0",
                  }
            }
        }
    }))
});

test('DynamoDB Table Created With Encryption', () => {
    const stack = new cdk.Stack();

    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'MyTestLambda', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromInline('test')
        })
    });

    expectCDK(stack).to(haveResource('AWS::DynamoDB::Table', {
        SSESpecification: {
            SSEEnabled: true
        }
    }));
});

test('readCapacity can be configured', () =>{
    const stack = new cdk.Stack();

    expect(() => {
        new HitCounter(stack, 'MyTestConstruct', {
            downstream: new lambda.Function(stack, 'MyTestLambda', {
                runtime: lambda.Runtime.NODEJS_14_X,
                handler: 'lambda.handler',
                code: lambda.Code.fromInline('test')
            }),
            readCapacity: 3
        })
    }).toThrowError(/readCapacity must be greater than 5 and lower than 20/);
});
