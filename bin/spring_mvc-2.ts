#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SpringMvc2Stack } from '../lib/spring_mvc-2-stack';

const app = new cdk.App();
new SpringMvc2Stack(app, 'SpringMvc2Stack');
