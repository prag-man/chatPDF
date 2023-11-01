import { PineconeClient, Vector, utils as PineconeUtils } from '@pinecone-database/pinecone'
import { downloadFromFirebase } from './firebase-server';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Document, RecursiveCharacterTextSplitter } from '@pinecone-database/doc-splitter'
import { getEmbeddings } from './embeddings';
import md5 from 'md5'
import { convertToAscii } from './utils';

let pinecone: PineconeClient | null = null;

export const getPineconeClient = async () => {
    if(!pinecone){
        pinecone = new PineconeClient()
        await pinecone.init({
            environment: process.env.PINECONE_ENV!,
            apiKey: process.env.PINECONE_API_KEY!,
        }) 
    } 
    return pinecone
}

async function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

type PDFPage = {
    pageContent: string;
    metadata: {
        loc: {pageNumber: number}
    }
}

export async function loadFirebaseIntoPinecone(fileKey: string){
    console.log('Downloading Firebase into file system')
    const file_name = await  downloadFromFirebase(fileKey)
    console.log(file_name)
    if(!file_name!){
        throw new Error("Couldn't download PDF") 
    }
    const loader = new PDFLoader(file_name);
    await delay(500)
    const pages = (await loader.load()) as PDFPage[];

    // split and segment the pdf
    const documents = await Promise.all(pages.map(prepareDocument))

    // vectorise and embed individual documents
    const vectors = await Promise.all(documents.flat().map(embedDocument))

    // upload to pinecone
    const client = await getPineconeClient()
    const pineconeIndex = client.Index('chatpdf')
    console.log('Insering vectors into pinecone')
    const namespace = convertToAscii(fileKey)
    //PineconeUtils.chunkedUpsert(pineconeIndex, vectors, namespace  10)
    PineconeUtils.chunkedUpsert(pineconeIndex, vectors, '', 10)
    return documents[0]
}    
    
async function embedDocument(doc: Document){
    try {
        const embeddings = await getEmbeddings(doc.pageContent)
        const hash = md5(doc.pageContent)
        return {
            id: hash,
            values: embeddings,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber
            }
        } as Vector
    } catch (error) {
        console.log('Error embedding document', error)
        throw error
    }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
}

async function prepareDocument(page: PDFPage){
    let {pageContent, metadata} = page
    pageContent = pageContent.replace(/\n/g,'')
    //split the docs
    const splitter = new RecursiveCharacterTextSplitter()
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByBytes(pageContent, 36000)
            }
        })
    ])
    return docs
}
