import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";

export class SpringMvc2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "SpringVpc", {
      maxAzs: 3,
      natGateways: 1
    });

    const cluster = new ecs.Cluster(this, "SpringCluster", {
      vpc: vpc,
      clusterName: "SpringCluster-1"
    });

    // Create a load-balanced Fargate service and make it public
    const springbootApp = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyFargateService", {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      desiredCount: 1, // Default is 1
      taskImageOptions: {
        containerPort: 8080,
        image: ecs.ContainerImage.fromAsset('./sb-app')
      },
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true // Default is false
    });
    springbootApp.targetGroup.configureHealthCheck({
      "port": 'traffic-port',
          "path": '/actuator/health',
          "interval": cdk.Duration.seconds(5),
          "timeout": cdk.Duration.seconds(4),
          "healthyThresholdCount": 2,
          "unhealthyThresholdCount": 2,
          "healthyHttpCodes": "200,301,302"
    });
    const springbootAutoScaling = springbootApp.service.autoScaleTaskCount({
      maxCapacity: 6,
      minCapacity: 1
  });
  springbootAutoScaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 45,
      policyName: "cpu autoscaling",
      scaleInCooldown: cdk.Duration.seconds(30),
      scaleOutCooldown: cdk.Duration.seconds(30)
  });
  }
}
