import { useEffect, useState } from "react";

export default function AllMoviesComp(){
    const [movies, setMovies] = useState([]);
    const [reqPending, setReqPending] = useState(false);

    async function fetchMovies(){
        try {
            setReqPending(!reqPending);
            const apiReq = await fetch('http://127.0.0.1:8000/api/v1/movies',{
                method: "GET",
                headers: {
                    "Content-Type" : "application/json",
                }
            });
            const apiRes = await apiReq.json();
            if(apiRes?.data?.movies){
                setReqPending(false);
                setMovies(apiRes?.data?.movies);
            }else{
                setMovies([]);
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        fetchMovies()
    },[])


    return <div>
        <button onClick={fetchMovies}>fetch data</button><br />
        {reqPending ? <span>LOADING</span> : null}<br/>
        {
            movies && movies.length > 0 ? movies.map((movie)=>(<span key={movie._id}>{movie.name}<br></br></span>)) : null
        }
    </div>
}