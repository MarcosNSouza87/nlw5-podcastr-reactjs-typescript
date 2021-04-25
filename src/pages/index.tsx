import { GetStaticProps } from "next";
import { api } from "../services/api";
import { format,parseISO } from "date-fns";
import ptBR from 'date-fns/locale/pt-BR'
import { convertDurationToTimeString } from "../util/convertDurationToTimeString";
import styles from './home.module.scss'
import Image from 'next/image'
import Link from 'next/link'

type Episode = {
  id:string;
  title:string;
  members:string;
  thumbnail:string; 
  duration:number;
  durationAsString:string;
  url:string;
  published_at:string;
}
 type HomeProps = {
  latestEpisodes:Episode[];
  allEpisodes:Episode[];
  //episodes: Episode[];//Array<Episode>;
  //Array<{  id:string;  title:string;  members:string; }>
}

export default function Home({latestEpisodes,allEpisodes}:HomeProps) {
 // console.log(props)
  return (
    <div className={styles.homepage}> 
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos       </h2>
        <ul>
          {latestEpisodes.map(episode => {
            return(
              <li key={episode.id}>
                <Image 
                  width={192} 
                  height={192} 
                  src={episode.thumbnail} 
                  alt={episode.title}
                  objectFit="cover"
                />
                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a >{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.published_at}</span>
                  <span>{episode.durationAsString}</span>
                </div>
                <button type='button'>
                  <img src="/play-green.svg" alt="Tocar episódio"/>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
      <section className={styles.allEpisodes}>
        <h2>Todos os episódios</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map(episode=>{
              return(
                <tr key={episode.id}>
                  <td style={{width:72}}>
                    <Image
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{width:100}}>{episode.published_at}</td>
                  <td>{episode.durationAsString}</td>
                  <td>                
                    <button type='button'>
                      <img src="/play-green.svg" alt="Tocar episódio"/>
                    </button>
                  </td>
                </tr>
              )
            }) }
          </tbody>
        </table>
      </section>
    </div>
  )
}

export  const getStaticProps:GetStaticProps = async () => {

  const {data} = await api.get('episodes',{
    params:{
      _limit:12,
      _sort:'published_at',
      _order:'desc'
    }
  })
  const episodes = data.map(episode => {
    return{
      id: episode.id,
      title: episode.title,
      members: episode.members,
      thumbnail: episode.thumbnail, 
      published_at: format(parseISO(episode.published_at),'d MMM yy',{locale:ptBR}),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)), 
      url: episode.file.url,
      duration: Number(episode.file.duration) ,
    }
  })

  const latestEpisodes = episodes.slice(0,2);
  const allEpisodes = episodes.slice(2, episodes.length);
  return{
    props:{
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8,
  }
}