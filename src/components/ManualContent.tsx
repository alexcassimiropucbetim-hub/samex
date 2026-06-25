export function ManualContent() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="space-y-6 text-slate-700">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Manual do Usuário: Sistema de Agendamento</h1>
          <p className="text-lg text-slate-600">
            Bem-vindo(a) ao <strong>Manual do Sistema de Agendamento</strong>. Este guia foi elaborado para auxiliar <strong>Encarregados Locais</strong>, <strong>Regionais</strong> e <strong>Examinadoras</strong> a utilizarem o portal de forma simples e eficiente.
          </p>
        </div>
        
        <hr className="border-slate-200" />
        
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Acesso ao Sistema</h2>
          <p className="mb-4">Para acessar o portal, siga os passos abaixo:</p>
          <ol className="list-decimal pl-6 space-y-2 mb-6">
            <li>Acesse o link oficial do sistema através do seu navegador (no computador, tablet ou celular).</li>
            <li>Na tela de login, insira seu <strong>Usuário</strong> e <strong>Senha</strong>.</li>
            <li>Clique em <strong>Entrar</strong>.</li>
          </ol>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <p className="text-blue-800 text-sm">
              <strong>Nota:</strong> O seu perfil de usuário (Encarregado Local, Regional ou Examinadora) define quais funcionalidades estarão disponíveis para você no sistema.
            </p>
          </div>
        </section>

        <hr className="border-slate-200" />
        
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Perfis de Acesso</h2>
          <p className="mb-4">O sistema é dividido para atender as necessidades específicas de cada cargo:</p>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Encarregado Local:</strong> Possui acesso exclusivo ao módulo de <strong>Pré-Avaliação</strong>, onde poderá cadastrar pedidos e visualizar apenas os candidatos da sua respectiva comum congregação (igreja).</li>
            <li><strong>Examinadora:</strong> Possui acesso ao <strong>Painel de Controle (Dashboard)</strong>, <strong>Agendamento de Testes</strong> e listagem geral de <strong>Pré-Avaliações</strong> referentes à candidatas (gênero feminino).</li>
            <li><strong>Regional:</strong> Possui acesso total aos módulos operacionais do portal: <strong>Painel de Controle</strong>, <strong>Agendamento de Testes</strong> e visão geral de todas as <strong>Pré-Avaliações</strong> (candidatos e candidatas).</li>
          </ul>
        </section>

        <hr className="border-slate-200" />

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Navegação (Menu Lateral)</h2>
          <p className="mb-4">Dependendo do seu perfil, o menu lateral esquerdo exibirá diferentes opções no <strong>Painel do Encarregado / Regional</strong>:</p>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Início:</strong> Leva ao Painel de Controle (Dashboard) com estatísticas do sistema <em>(Regionais e Examinadoras)</em>.</li>
            <li><strong>Pré-Avaliação:</strong> Leva à página de cadastro e listagem de inscrições de candidatos <em>(Todos os perfis)</em>.</li>
            <li><strong>Agendar Teste:</strong> Leva à área de gerenciamento de datas e locais de teste <em>(Regionais e Examinadoras)</em>.</li>
            <li><strong>Sair do Sistema:</strong> Encerra a sua sessão com segurança.</li>
          </ul>
        </section>

        <hr className="border-slate-200" />

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Módulos do Sistema</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-2">4.1. Painel de Controle (Dashboard)</h3>
            <p className="text-sm text-slate-500 mb-3"><em>(Exclusivo para Regionais e Examinadoras)</em></p>
            <p className="mb-4">Logo ao entrar, você visualizará o <strong>Painel de Controle</strong>, que oferece um resumo rápido da situação atual dos agendamentos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Inscrições Totais:</strong> Número de cadastros gerais de pré-avaliação no sistema.</li>
              <li><strong>Pré-Avaliações Pendentes:</strong> Cadastros que ainda aguardam avaliação ou não foram agendados/finalizados.</li>
              <li><strong>Agendamento de Testes:</strong> Total de datas de teste disponíveis ou já marcadas, além da indicação de quantos candidatos já foram alocados para essas datas.</li>
              <li><strong>Gráficos e Indicadores:</strong> Logo abaixo, são exibidos gráficos detalhando dados por Setores, Categorias de Instrumento e Tipos de Teste.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-2">4.2. Módulo: Pré-Avaliação</h3>
            <p className="text-sm text-slate-500 mb-3"><em>(Disponível para Todos)</em></p>
            <p className="mb-4">Este é o módulo onde se registra o pedido de exame do(a) candidato(a) e é o principal ambiente de trabalho para o <strong>Encarregado Local</strong>.</p>
            
            <h4 className="font-bold text-slate-800 mt-4 mb-2">Como Cadastrar um Pedido</h4>
            <ol className="list-decimal pl-6 space-y-2 mb-6">
              <li>Acesse o menu <strong>Pré-Avaliação</strong>.</li>
              <li>Logo no topo, você verá o formulário <strong>Pedido de Pré-Avaliação</strong>.<br/>
              <span className="text-sm text-slate-500"><em>(Para o Encarregado Local, as opções de Congregação e Setor já virão preenchidas de acordo com sua igreja de origem)</em>.</span></li>
              <li>Preencha as etapas do formulário com os dados do(a) candidato(a):
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Dados Básicos:</strong> Nome, Instrumento, Congregação, etc.</li>
                  <li><strong>Situação Musical:</strong> Tipo de Teste, Nível de Ensino (MSA), Justificativas (se houver necessidade especial).</li>
                </ul>
              </li>
              <li>Ao finalizar, clique no botão de salvar/confirmar. O candidato entrará na lista de <strong>Inscrições Cadastradas</strong>.</li>
            </ol>

            <h4 className="font-bold text-slate-800 mb-2">Inscrições Cadastradas</h4>
            <p className="mb-2">No final da página, você verá uma tabela com todas as inscrições:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Encarregado Local:</strong> Verá apenas os candidatos que ele mesmo cadastrou (ou que pertencem à sua igreja).</li>
              <li><strong>Examinadora:</strong> Verá todas as candidatas (Feminino) do setor.</li>
              <li><strong>Regional:</strong> Verá todos os candidatos e candidatas (Geral).</li>
            </ul>
            <p className="mb-6">Nesta lista, é possível verificar o status atual da inscrição (Pendente, Agendado, etc.) e visualizar detalhes do formulário enviado.</p>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <p className="text-amber-800 text-sm">
                <strong>Dica:</strong> Caso cadastre alguma informação equivocada, procure na lista de inscrições o botão de <strong>Editar (Lápis)</strong> para corrigir os dados antes que o candidato seja agendado por um Regional/Examinadora.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">4.3. Módulo: Agendamento de Testes</h3>
            <p className="text-sm text-slate-500 mb-3"><em>(Exclusivo para Regionais e Examinadoras)</em></p>
            <p className="mb-4">Neste módulo é feita a gestão prática dos testes que irão ocorrer:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Acesse <strong>Agendar Teste</strong> no menu.</li>
              <li>Você poderá visualizar as datas marcadas para testes na região.</li>
              <li>É possível alocar as <strong>Pré-Avaliações Pendentes</strong> para uma data/local específico.</li>
              <li>Após o teste, é através das listas geradas aqui que se realiza a validação dos resultados finais.</li>
            </ol>
          </div>
        </section>

        <hr className="border-slate-200" />

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Dicas de Uso e Boas Práticas</h2>
          <ul className="list-disc pl-6 space-y-3 mb-6">
            <li><strong>Sempre encerre sua sessão:</strong> Quando terminar de usar o sistema (principalmente em computadores públicos ou da igreja), não feche apenas a janela. Clique sempre em <strong>Sair do Sistema</strong> no menu lateral.</li>
            <li><strong>Inatividade:</strong> Por segurança, o sistema pode deslogar automaticamente caso você fique muito tempo sem movimentar ou clicar na tela. Se isso acontecer, basta fazer o login novamente.</li>
            <li><strong>Atualização da Página:</strong> Se não estiver visualizando uma inscrição recente ou dados atualizados no painel, tente recarregar a página ou clique na logomarca/botão <em>Início</em> para forçar a atualização.</li>
          </ul>
          <p className="text-slate-600 italic">Em caso de dúvidas ou problemas técnicos, procure a equipe de suporte ou o administrador da sua região.</p>
        </section>
      </div>
    </div>
  );
}
