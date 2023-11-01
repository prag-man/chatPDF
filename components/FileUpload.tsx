"use client"
import { Inbox, Loader2 } from 'lucide-react'
import { FC } from 'react'
import {useDropzone} from 'react-dropzone'
import {getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject} from 'firebase/storage'
import app from '@/lib/firebase'
import { useState, useEffect } from 'react'
import Progress_bar from './ProgessBar'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import {useRouter} from 'next/navigation'

const FileUpload: FC = () => {

  const router = useRouter()
    const [uploading, setUploading] = useState(false)
    const {mutate} = useMutation({
        mutationFn: async ({file_key, file_name}: {file_key: string, file_name:string}) =>{
            const response = await axios.post('/api/create-chat',{
                file_key,
                file_name
            })
            return response.data
        }
    })

    const storage = getStorage(app)

    const [temp, setTemp] = useState('')
    const [file,setFile] = useState([])
    const [filePerc, setFilePerc] = useState()
    const [fileLink, setFileLink] = useState('')

    const handleSelectedFile = (file: any) => {
        if(file[0].size < 10*1024*1024){
          setFile(file)
        }else{
            //here toast should be there
          toast.error('Please insert document lesser than 10 mb')
        }
      }

    const handleDelete = () => {
        setFile([])
        console.log(temp)
        const desertRef = ref(storage, temp);
    
        // Delete the file
        deleteObject(desertRef).then(() => {
          toast.success('Document deleted successfully!')
        }).catch((error) => {
          // Uh-oh, an error occurred!
        });
      }

      const uploadFile = async (file: any) => {
        setUploading(true)
        // const fileName = new Date().getTime() + file.name
        const fileName = file.name
        setTemp(fileName)
        const storageRef = ref(storage, fileName)
        const uploadTask = uploadBytesResumable(storageRef,file)
    
        uploadTask.on("state_changed",(snapshot)=>{
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setFilePerc(Math.trunc(progress))
          switch(snapshot.state){
            case "paused":
              console.log('upload is paused')
              break;
            case 'running':
              console.log('upload is running')
              break;
            case 'canceled':
              setUploading(false)
              setFile([])
              console.log('upload canceled')
              break;
            default:
              break;
          }
        },
          (error)=>{},
          ()=>{
            getDownloadURL(uploadTask.snapshot.ref).then((downlaodURL)=>{
              console.log('file available at ', downlaodURL)
              setFileLink(downlaodURL)
              mutate({
                file_key: downlaodURL,
                file_name: temp
               },{
                onSuccess: ({chat_id}) => {
                  setUploading(false)
                  toast.success('Chat Created!')
                  //router.push(`/chat/${chat_id}`)
                },
                onError: (err) => {
                  setUploading(false)
                    console.log(err)
                }
               })
            })
          })
      }
    
      useEffect(() =>{
        file[0] ? uploadFile(file[0]) : ''
      },[file])

    const {getRootProps, getInputProps} = useDropzone({
        accept: {"application/pdf":[".pdf"]},
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            if(file[0]){
                handleDelete()
            }
            handleSelectedFile(acceptedFiles)
        }, 
        // maxSize: 10000000
    })

  return <div className="p-2 bg-white rounded-xl flex gap-5 flex-col ">
    <div {...getRootProps({
        className: 'border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col'
    })}>
        <input {...getInputProps()}/>
        {uploading ? (
          <>
            <Loader2 className='h-10 w-10 text-blue-500 animate-spin' />
            <p className='text-slate-400 mt-2 text-sm'>Spilling Tea to GPT....</p>
          </>
        ) : (
        <>
            <Inbox className='w-10 h-10 text-blue-500' />
            <p className='mt-2 text-sm text-slate-400'>Drop PDF here</p>
        </>
        )}
    </div>
    {file[0]?.name && ( 
           <div className="flex p-2 justify-between w-full">
            {(100 > filePerc!) ? <>
                <Progress_bar bgcolor="black" progress={filePerc!}  height={30} />
            </> : <>
              <span className="ml-5 truncate ...">{file[0].name}</span>
              <span className="text-xl font-bold mr-5 cursor-pointer" onClick={handleDelete}>X</span>
            </>}
         </div>
        )}
  </div>
}

export default FileUpload