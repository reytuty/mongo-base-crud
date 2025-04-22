# 🧩 mongo-base-crud

**Biblioteca TypeScript para facilitar operações CRUD com MongoDB.**  
Ideal para projetos whitelabel, com suporte a múltiplos bancos, aliases dinâmicos e padrão Singleton.

---

## 📦 Instalação

```bash
npm install mongo-base-crud



⸻

⚙️ Configuração

Crie um arquivo .env com:

MONGO_URL="mongodb://admin:admin@localhost:27017"
MONGO_DB=test
MONGO_PREFIX_NAME=test_

	•	MONGO_URL: URL de conexão do Mongo
	•	MONGO_DB: Nome base do banco de dados
	•	MONGO_PREFIX_NAME: Prefixo usado para projetos multi-tenant ou whitelabel

⸻

🧠 Sobre getInstance e .instance()

🔹 BaseCrud.getInstance(...)

Cria ou retorna uma instância Singleton global, útil para casos genéricos e dinâmicos. A chave de instância é composta por dbName_collectionName.

🔸 .instance(alias: string)

Método recomendado para criar repositórios reutilizáveis com nomes únicos, ideal em projetos whitelabel. Internamente usa getInstance com chaves personalizadas por alias.

⸻

🧪 Exemplo com .instance()

import { Singleton } from "typescript-singleton";
import { BaseCrud } from "mongo-base-crud";

interface User {
  id: string;
  name: string;
}

export class UserRepository extends BaseCrud<User> {
  public static instance(clinicAlias: string): UserRepository {
    const dbName = `clinic_${clinicAlias}`;
    return Singleton.getInstance<UserRepository>(
      `UserRepo_${clinicAlias}`, // chave única da instância
      UserRepository,
      "users",
      dbName,
      { name: 1 } // indexes
    );
  }

  constructor(collection = "users", dbName = "default", indexes = {}) {
    super(collection, dbName, indexes);
  }
}



⸻

📚 Métodos Disponíveis

🧩 save(data: object): Promise<DocumentWithId>

Salva um novo documento no banco de dados. O método também funciona como upsert, ou seja:
	•	Se o id não for enviado, será gerado automaticamente.
	•	Se o id for enviado, o documento será substituído completamente caso já exista ou será criado com esse id.

⚠️ Atenção: O save não faz merge dos dados existentes — ele sobrescreve totalmente o documento anterior se o id existir.

✅ Exemplo 1: salvar um novo documento sem id (geração automática)

const saveResult: { id: string } = await UserRepository.instance("acme").save({
  name: "João"
});

console.log("Novo documento criado com ID:", saveResult.id);

✅ Exemplo 2: salvar com id customizado (comportamento upsert)

await UserRepository.instance("acme").save({
  id: "my-custom-id",
  name: "Maria"
});



⸻

✏️ update(data: { id: string, ... }): Promise<DocumentWithId>

Atualiza completamente um documento com base no id.

await UserRepository.instance("acme").update({
  id: "123",
  name: "Atualizado"
});



⸻

🧩 partialUpdate(id: string, data: object): Promise<DocumentWithId>

Atualiza parcialmente os campos de um documento sem sobrescrever os demais.

await UserRepository.instance("acme").partialUpdate("123", {
  name: "Parcial"
});



⸻

🔍 find(filter?, select?, skip?, limit?, orderBy?, direction?, searchValue?, searchFields?): Promise<List<T>>

Busca com suporte a:
	•	Filtros exatos
	•	Paginação
	•	Ordenação
	•	Busca textual com múltiplos campos

await UserRepository.instance("acme").find(
  { active: true },
  { id: true, name: true },
  0,
  10,
  "name",
  "asc",
  "jo",
  ["name"]
);



⸻

📋 findAll(filter?, select?, orderBy?, direction?, searchValue?, searchFields?): Promise<T[]>

Versão sem paginação do find.

await UserRepository.instance("acme").findAll(
  { active: true },
  { name: true },
  "name",
  "asc"
);



⸻

🔍 getById(id: string): Promise<T | null>

Busca um único documento por id.

const user = await UserRepository.instance("acme").getById("123");



⸻

❌ delete(id: string): Promise<boolean>

Remove um documento por id.

await UserRepository.instance("acme").delete("123");

⸻

🔄 aggregate(filter: object[]): Promise<T[]>

Executa uma operação de agregação no banco de dados com base no pipeline fornecido.

✅ Exemplo: agregação para contar documentos por nome

```typescript
const filter = [
  {
    $group: {
      _id: "$details.name",
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      name: "$_id",
      count: 1,
    },
  },
];

const aggregateResult = await UserRepository.instance("acme").aggregate<{ name: string; count: number }[]>(filter);

console.log("Resultado da agregação:", aggregateResult);
```

⚠️ Atenção: Certifique-se de que o pipeline de agregação esteja de acordo com a estrutura dos documentos no banco de dados.

⸻

🏗️ BaseCrud.getInstance(...)

Uso genérico de um repositório:

const crud = BaseCrud.getInstance<{ id: string; name: string }>(
  "users",
  "clinic_acme",
  { name: 1 }
);

await crud.save({ name: "Exemplo" });



⸻

📌 Requisitos
	•	Node.js >= 14
	•	MongoDB >= 4.x
	•	TypeScript

⸻

✅ Testes

Consulte os testes com Vitest no diretório /test.

it("deve salvar um novo documento", async () => {
  const result = await UserRepository.instance("acme").save({ name: "Teste" });
  expect(result.id).toBeDefined();
});



⸻

🤝 Contribuindo

Pull Requests são bem-vindos. Sugestões, exemplos de uso e melhorias são muito apreciadas.

⸻

📝 Licença

Apache-2.0 © IDress : Renato Miawaki

