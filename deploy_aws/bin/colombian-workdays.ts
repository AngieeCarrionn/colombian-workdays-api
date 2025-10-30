#!/usr/bin/env node
/**
 * @fileoverview
 * Punto de entrada principal para la infraestructura AWS CDK
 * del proyecto "Colombian Workdays API".
 *
 * Este archivo crea una aplicación CDK, instancia el stack principal
 * y define la región de despliegue en AWS.
 *
 * CDK (Cloud Development Kit) permite definir infraestructura de AWS
 * usando código TypeScript en lugar de archivos YAML o configuraciones manuales.
 *
 * Comandos principales:
 * - `cdk synth`: genera la plantilla de CloudFormation (previa al despliegue)
 * - `cdk bootstrap`: prepara la cuenta de AWS para usar CDK
 * - `cdk deploy`: despliega los recursos definidos en el stack
 */
import * as cdk from "aws-cdk-lib"; // Biblioteca principal del AWS CDK
import { ColombianWorkdaysStack } from "../lib/colombian-workdays-stack"; // Importa la definición del stack principal
// Crea una nueva aplicación CDK (equivalente a la raíz de tu proyecto de infraestructura)
const app = new cdk.App();
/**
 * Crea una instancia del stack "ColombianWorkdaysStack".
 *
 * Parámetros:
 * - `app`: la aplicación CDK actual (contenedor de stacks)
 * - `"ColombianWorkdaysStack"`: nombre lógico del stack
 * - `env`: define la región y cuenta donde se desplegarán los recursos
 *
 * Nota:
 * - La región puede modificarse según la cuenta AWS
 * - Si no esta definido`env`, CDK intentará usar la configuración por defecto del perfil AWS
 */
new ColombianWorkdaysStack(app, "ColombianWorkdaysStack", {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || "us-east-1",
    },
});
