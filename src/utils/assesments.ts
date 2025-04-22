import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getQuestions = async(slug:string)=>{
    try {
        const res = await axios.get(
          `${baseUrl}/${slug}/a_get_questions.php?test_slug=${slug}&page=1`
        );


        
    } catch (error) {
        console.log(error);
        return null;
        
    }


}