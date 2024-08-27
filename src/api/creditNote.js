import axios from 'axios';
import { originAPi } from '../lib/store';
export const getCreditNote = async (req , res)=>{
  const getRes = await axios.post(`${originAPi}/marketing-material/credit-note`)
  console.log(getRes.data)
  return getRes.data
}