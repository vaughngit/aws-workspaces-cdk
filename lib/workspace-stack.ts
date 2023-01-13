import { aws_workspaces as workspaces, Stack, StackProps, aws_directoryservice as directoryservice } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {aws_ec2 as ec2} from 'aws-cdk-lib'
import {VpcConstruct} from './vpc-construct'



export interface IStackProps extends StackProps{
  environment: string; 
  solutionName: string; 
  costcenter: string; 
}


export class WorkspaceStack extends Stack {

  /**
   * VPC 
   */
  vpc: ec2.Vpc;
  

  constructor(scope: Construct, id: string, props: IStackProps) {
    super(scope, id, props);

    // API Gateway ============================================
    const dirvpc = new VpcConstruct(this, 'vpc', {
      costcenter: props.costcenter,
      environment: props.environment,
      solutionName: props.solutionName
    });

    this.vpc = dirvpc.vpc; 

 
    const cfnMicrosoftAD = new directoryservice.CfnMicrosoftAD(this, 'MyCfnMicrosoftAD', {
      name: 'demouser',
      password: '',
      vpcSettings: {
        subnetIds: [
          this.vpc.privateSubnets[0].subnetId,
          this.vpc.privateSubnets[1].subnetId,
          this.vpc.privateSubnets[2].subnetId,
        
        ],
        vpcId: this.vpc.vpcId,
      },
    
      // the properties below are optional
      
      createAlias: false,
      edition: 'Standard', // AWS Managed Microsoft AD is available in two editions: Standard and Enterprise .
      enableSso: true,
      shortName: 'technet',

    });

    const cfnWorkspace = new workspaces.CfnWorkspace(this, 'MyCfnWorkspace', {
      bundleId: 'wsb-8vbljg4r6',
      directoryId: cfnMicrosoftAD.ref, //'directoryId',
      userName: 'demouser',
    
       // the properties below are optional
      // rootVolumeEncryptionEnabled: false,
      // tags: [{
      //   key: 'key',
      //   value: 'value',
      // }],
      // userVolumeEncryptionEnabled: false,
      // volumeEncryptionKey: 'volumeEncryptionKey',
      // workspaceProperties: {
      //   computeTypeName: 'computeTypeName',
      //   rootVolumeSizeGib: 123,
      //   runningMode: 'runningMode',
      //   runningModeAutoStopTimeoutInMinutes: 123,
      //   userVolumeSizeGib: 123,
    //  }, 
    }); 
    
  }
}
