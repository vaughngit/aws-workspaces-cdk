#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WorkspaceStack } from '../lib/workspace-stack';
import { Stack, Tags } from 'aws-cdk-lib';
//import {VpcConstruct} from '../lib/vpc-construct'
import { VTVpc } from 'vt-vpc-construct'; 

const aws_region = 'us-east-1'
const solutionName = "workspacesdeploy"
const environment = "dev"
const costcenter = "workspacedemo"


const app = new cdk.App();



    const env = {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: aws_region || process.env.CDK_DEFAULT_REGION,
    };
    const stack = new Stack(app, 'vpcstack', {
      env,
      tags: {
        solutionName,
        environment,
        costcenter,
      },
    });

    
    new VTVpc(stack, 'vpc', {
      costcenter: costcenter,
      environment: environment,
      solutionName: solutionName,
      name: "workspacetesting"
    });
    

 
new WorkspaceStack(app, 'WorkspaceStack', {
  stackName: `${solutionName}-ecs-network-${aws_region}`,
  env: { 
   account: process.env.CDK_DEFAULT_ACCOUNT,
   region: aws_region || process.env.CDK_DEFAULT_REGION
 },
 tags: {
  solution:solutionName,
  environment,
  costcenter,
},
 environment, 
 solutionName, 
 costcenter  
});