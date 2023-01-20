import { aws_workspaces as workspaces, Stack, StackProps, aws_directoryservice as directoryservice, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {aws_ec2 as ec2} from 'aws-cdk-lib'
//import {VpcConstruct} from './vpc-construct'
import { Vpc } from 'aws-cdk-lib/aws-ec2';



export interface IStackProps extends StackProps{
  environment: string; 
  solutionName: string; 
  costcenter: string; 
}


export class WorkspaceStack extends Stack {

  /**
   * VPC 
   */
 // network: ec2.Vpc;
  

  constructor(scope: Construct, id: string, props: IStackProps) {
    super(scope, id, props);


/*  

    let dirvpc = new VpcConstruct(this, 'vpc', {
      costcenter: props.costcenter,
      environment: props.environment,
      solutionName: props.solutionName
    });

    this.network = dirvpc.vpc;  
  */

    // let test = Vpc.fromLookup(this, "vpcid", {
    //   vpcId: Fn.importValue(`${props.solutionName}:${props.environment}:VPCID:${this.region}`).toString()
    // })

    
    const test = Vpc.fromVpcAttributes(this, 'import-vpc', {
      availabilityZones: [Fn.importValue(`${props.solutionName}:PrivateAZ0`), Fn.importValue(`${props.solutionName}:PrivateAZ1`), Fn.importValue(`${props.solutionName}:PrivateAZ2`)],
      privateSubnetIds: [
        Fn.importValue(`${props.solutionName}:PrivateSubnet0`),
        Fn.importValue(`${props.solutionName}:PrivateSubnet1`),
        Fn.importValue(`${props.solutionName}:PrivateSubnet2`)
      ],
      vpcId: Fn.importValue(`${props.solutionName}:${props.environment}:VPCID:${this.region}`),
    });

    // Iterate the private subnets
    const selection = test.selectSubnets({
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
    });
 
    const cfnMicrosoftAD = new directoryservice.CfnMicrosoftAD(this, 'MyCfnMicrosoftAD', {
      name: 'demouser',
      password: '',
      vpcSettings: {
        // subnetIds: [
        //   // dirvpc.vpc.privateSubnets[0].subnetId,
        //   // dirvpc.vpc.privateSubnets[1].subnetId,
        //   // dirvpc.vpc.privateSubnets[2].subnetId
        //   selection.subnetIds
        // ],
        subnetIds: selection.subnetIds,
        vpcId: test.vpcId,
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
