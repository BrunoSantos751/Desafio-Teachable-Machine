# Desafio Teachable Machine - Point up Game 🎮

Este projeto é um jogo interativo controlado por gestos, desenvolvido como parte de um desafio de implementação de Inteligência Artificial usando o **Teachable Machine** do Google.

O objetivo é controlar um personagem (estilo Dino Run) usando movimentos das mãos capturados pela webcam.

## 🔗 Links Importantes

-   **Jogue Agora (Demo Online):** [https://brunosantos751.github.io/Desafio-Teachable-Machine/](https://brunosantos751.github.io/Desafio-Teachable-Machine/)
-   **Modelo Teachable Machine:** [https://teachablemachine.withgoogle.com/models/yZCQUeRsJ/](https://teachablemachine.withgoogle.com/models/yZCQUeRsJ/)

## 🕹️ Como Jogar

O jogo utiliza a sua webcam para detectar gestos e controlar as ações. Certifique-se de estar em um ambiente bem iluminado para melhor detecção.

### Comandos de Gesto:

1.  **Iniciar (Mão aberta / Gesto de 'Start')**:
    -   Utilizado para começar o jogo ou reiniciar após o Game Over.
    -   Label no modelo: `iniciar` ou `mao aberta`.

2.  **Pular (Apontar para Cima ☝️)**:
    -   Faça o personagem pular os obstáculos.
    -   Label no modelo: `pular`.


## 🚀 Tecnologias Utilizadas

-   **HTML5 & CSS3**: Estrutura e estilização do jogo.
-   **JavaScript (ES6+)**: Lógica do jogo e manipulação do DOM.
-   **TensorFlow.js**: Biblioteca base para execução do modelo.
-   **Teachable Machine Image**: Biblioteca para carregar e executar o modelo de imagem treinado.

## 🛠️ Como Executar Localmente

1.  Clone este repositório:
    ```bash
    git clone https://github.com/brunosantos751/Desafio-Teachable-Machine.git
    ```
2.  Navegue até a pasta do projeto:
    ```bash
    cd Desafio-Teachable-Machine
    ```
3.  Abra o arquivo `index.html` em seu navegador ou use uma extensão como o "Live Server" no VS Code para rodar localmente (recomendado para evitar problemas de permissão com a câmera).

## 🧠 Sobre o Modelo

O modelo de Inteligência Artificial foi treinado no [Teachable Machine](https://teachablemachine.withgoogle.com/) para reconhecer 3 classes principais de imagens:
-   **Pular**: Gesto indicando pulo.
-   **Iniciar**: Gesto para iniciar a partida.
-   **Clean**: Fundo/Sem gesto ativo.

Os arquivos do modelo (`model.json`, `metadata.json`, `weights.bin`) estão localizados na pasta `/model`.
