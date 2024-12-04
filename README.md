# Tech-Challenge - Grupo 38-7SOAT

Este é o projeto desenvolvido durante o curso de pós-graduação em Arquitetura de Software da FIAP.

Membros do grupo:
* Ketlin Fabri dos Santos – RM35453
* Lucas Antonio dos Santos – RM354629
* Matheus Akio Santos Ishiguro – RM354952

## Propósito do projeto

Implementar um sistema de gerenciamento de pedidos para uma empresa do setor alimentício.

## Stack utilizada

* Node.js v18
* TypeScript
* Postgresql
* Docker
* Kubernetes
* AWS
* Sonarqube
* RabbitMQ
* k8s


## Desenvolvimento do projeto

* Separado entre 3 microserviços: Customer, Order e Payment, além do serviço de configuraçâo de Infraestrutura. Este projeto refere-se à aplicação que faz o cadastro de produtos e pedidos, gerando uma ordem de pagamento que é consumida pelo serviço Payment - envio feito através de fila desenvolvida com RabbitMQ, que faz a comunicação e atualização do status de pagamento após consulta à API do Mercado Pago.

## Instalação do projeto

Este projeto está preparado para execução em um ambiente Docker. Portanto, será necessária apenas a instalação do Docker e/ou Kubernetes, sem a necessidade de instalar o projeto ou o banco de dados PostgreSQL manualmente.

Caso não tenha o Docker instalado, siga as instruções para seu sistema operacional na [documentação oficial do Docker](https://docs.docker.com/get-docker/).

# Como executar o projeto localmente

- Fazer build da imagem Docker localmente com o comando abaixo:

```bash
❯ docker build -t tech-challenge:latest .
```

# Deploy

Para realizar o deploy desta aplicação, foi utilizado a integração do GitHub Actions, permitindo fazer o deploy diretamente na AWS, utilizando os arquivos Kubernetes presentes na pasta K8S. Para subir a imagem em ambiente produtivo, estamos utilizando o AWS ECR.

### Diagramas de fluxo

Foram utilizadas técnicas de Domain Driven Design para definição dos fluxos:
Todos os diagramas apresentados estão disponíveis no 

[Miro](https://miro.com/app/board/uXjVKUHWBkY=/?share_link_id=42148422473).

### Swagger
Todos os endpoints estão disponíveis para consulta via [Swagger](http://localhost:3000/api-docs/).

### Testes
A cobertura dos testes ficaram acima de 80%, conforme mostram as imagens de cobertura do Sonarqube e Jest.

## Cobertura de Testes - SONARQUBE
![Sonarqube](doc/sonarqube.png)

## Cobertura de Testes - Locais, utilizando Jest
![Jest](doc/jest.png)