Requisitos Gerais do Projeto

1\. Arquitetura Distribuída  
O projeto deve utilizar uma arquitetura distribuída, podendo ser qualquer modelo arquitetural (microsserviços, cliente-servidor, peer-to-peer, event-driven, etc.). A escolha da arquitetura deve ser justificada durante a apresentação, explicando os motivos que levaram à decisão e como ela se adequa ao tema trabalhado.

2\. Desenho da Arquitetura  
É obrigatório apresentar um diagrama da arquitetura do sistema, contendo:

* Componentes que compõem o sistema (serviços, módulos, bancos de dados, filas, etc.);  
* Tecnologias utilizadas em cada componente (ex: Node.js, Python, Redis, PostgreSQL, RabbitMQ, etc.);  
* Comunicação entre os componentes, com destaque para o protocolo de comunicação utilizado em cada interação (ex: HTTP/REST, gRPC, WebSocket, AMQP, TCP, etc.).

3\. Concorrência e Paralelismo  
O projeto deve fazer uso de concorrência e/ou paralelismo em alguma parte do sistema. É necessário sinalizar claramente no código ou na documentação onde esses conceitos estão sendo aplicados, indicando:

* Qual mecanismo foi utilizado (threads, processos, corrotinas, workers, etc.);  
* Em qual componente ou módulo está presente;  
* Qual problema essa abordagem resolve ou qual ganho ela proporciona.

4\. Otimização  
O projeto deve contemplar conceitos de otimização, podendo ser em desempenho, uso de recursos, tempo de resposta, entre outros. Devem ser indicados:

* Os pontos onde otimizações foram implementadas, explicando o que foi feito e qual o impacto esperado;  
* E/ou os pontos onde otimizações poderiam ser aplicadas futuramente, com uma breve justificativa do que poderia ser melhorado e como.

ENTREGA:  
README explicando onde cada um dos requisitos está implementado