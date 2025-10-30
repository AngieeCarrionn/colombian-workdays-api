/**
 * @fileoverview
 * Definición principal del Stack de AWS CDK para el proyecto
 * "Colombian Workdays API".
 *
 * Este stack crea dos recursos principales en AWS:
 * 1. Una función **AWS Lambda** que ejecuta la API Express (ya compilada desde TypeScript).
 * 2. Un **API Gateway** que expone públicamente la Lambda mediante una URL HTTP.
 *
 * CDK traduce este código TypeScript en una plantilla de CloudFormation,
 * que AWS usa para crear y administrar los recursos automáticamente.
 */

import * as cdk from "aws-cdk-lib"; // Biblioteca base de AWS CDK
import * as lambda from "aws-cdk-lib/aws-lambda"; // Módulo para definir funciones Lambda
import * as apigateway from "aws-cdk-lib/aws-apigateway"; // Módulo para crear una API Gateway
import { Construct } from "constructs"; // Clase base para todos los recursos CDK

/**
 * Clase que representa el stack completo de infraestructura.
 * 
 * El "Stack" es el conjunto de recursos AWS que se despliegan juntos,
 * por ejemplo: Lambdas, APIs, S3, DynamoDB, etc.
 */
export class ColombianWorkdaysStack extends cdk.Stack {
    /**
     * Constructor del stack.
     *
     * @param {Construct} scope - El contexto en el que se define este stack (la app principal CDK).
     * @param {string} id - Identificador único del stack.
     * @param {cdk.StackProps} [props] - Propiedades opcionales (como región o cuenta AWS).
     */
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        /**
            * Lambda Function
            * Esta función ejecuta la API Express dentro de AWS Lambda.
            *
            * Características:
            * - Usa Node.js 20 como entorno de ejecución.
            * - Ejecuta el handler `index.handler` (exportado desde `dist/index.js`).
            * - Carga el código desde la carpeta compilada `dist/`.
            * - Tiene 512 MB de memoria y un tiempo máximo de ejecución de 10 segundos.
            * - Se define la variable de entorno `NODE_ENV=production`.
            */
        const apiLambda = new lambda.Function(this, "ColombianWorkdaysFunction", {
            runtime: lambda.Runtime.NODEJS_20_X, // Entorno de ejecución
            handler: "index.handler",  // Punto de entrada (dist/index.js → export const handler)
            code: lambda.Code.fromAsset("../dist"), // Carpeta con el código compilado de TypeScript
            memorySize: 512,// Memoria asignada (en MB)
            timeout: cdk.Duration.seconds(10),// Tiempo máximo de ejecución
            environment: {// Variables de entorno accesibles desde la Lambda
                NODE_ENV: "production",
            },
        });

        /**
            *  API Gateway
            * Expone la función Lambda como un endpoint HTTP público.
            * - `proxy: true` →  todas las rutas de la app Express se manejarán por la Lambda.
            * - `stageName: "prod"` → define el entorno del despliegue (la URL incluirá `/prod/`).
            *
            * El resultado será una URL como:
            * https://abc123.execute-api.us-east-1.amazonaws.com/prod/
            */
        new apigateway.LambdaRestApi(this, "ColombianWorkdaysApi", {
            handler: apiLambda,  // Lambda asociada al endpoint
            proxy: true, // Redirige todas las rutas a Express
            deployOptions: {
                stageName: "prod", // Nombre del entorno de despliegue
            },
        });
    }
}
