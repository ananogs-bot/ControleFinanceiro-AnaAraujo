import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

mongoose.connect(process.env.MONGODB_URI, {dbName:'gestorFinanceiro'})
  .then(() => console.log('Conectado no banco de dados MongoDB'))
  .catch(err => console.error('Erro de conexão:', err.message));

const financaSchema = new mongoose.Schema({
    tipo: {type: String, required: true, trim:true, minlength: 2},
    categoria: {type: String, required: true, trim: true, minlength: 2},
    descricao: {type: String, required: true, trim: true, minlength: 2},
    data: {type: Date, required: true},
    valor: {type: Number, required: true, min: 0}
}, {collection: 'financas', timestamps: true });

const Financa = mongoose.model('financa', financaSchema, 'financas');

// Rota Inicial
app.get('/', (req, res) => res.json({message: 'API de Gestão Financeira está funcionando!'}));

// Criar Finança
app.post('/financas', async (req, res) => {
    const financa = await Financa.create(req.body);
    res.status(201).json(financa);
});

// Listar Finanças
app.get('/financas', async (req, res) => {
    const financas = await Financa.find();
    res.json(financas);
});

// Atualizar Finança
app.put('/financas/:id', async (req, res) => {
    try {
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({error: 'ID inválido'});
        }

        const financa = await Financa.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true, runValidators: true, overwrite: true}
        );
        if(!financa) return res.status(404).json({error: 'Finança não encontrada'});
        res.json(financa);
    } catch(err) {
        res.status(400).json({error: err.message});
    }
});

// Deletar Finança
app.delete('/financas/:id', async (req, res) => {
    try {
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({error: 'ID inválido'});
        }
        const financa = await Financa.findByIdAndDelete(req.params.id);
        if(!financa) return res.status(404).json({error: 'Finança não encontrada'});
        res.json({message: 'Finança deletada com sucesso'});
    } catch(err) {
        res.status(400).json({error: err.message});
    }
});

// Obter Finança por ID
app.get('/financas/:id', async (req, res) => {
    try {
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({error: 'ID inválido'});
        }
        const financa = await Financa.findById(req.params.id);
        if(!financa) return res.status(404).json({error: 'Finança não encontrada'});
        res.json(financa);
    } catch(err) {
        res.status(500).json({error: err.message});
    }
});

//Iniciar o servidor
app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em http:localhost:${process.env.PORT}`);
});