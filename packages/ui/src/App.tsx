import { useEffect, useState } from "react";
import { useSearch, useDownloadInfo, useDetails } from "./hooks/games";
import { commandToDownloadIt, countryEmoji } from "./Utils";
import { Platforms, SearchResult } from "gate-providers";

type AppState = {
  loading: boolean;
  searchTerm: string;
  currentItem?: SearchResult;
  currentPlatform?: string;
}

export function App() {

  const { query, queryResult, platforms } = useSearch();

  const [appState, setAppState] = useState<AppState>({
    loading: false,
    searchTerm: ''
  });

  const toggleLoading = (value: boolean) => {
    setAppState(last => ({ ...last, loading: value }));
  }

  const selectItem = (item: SearchResult | undefined = undefined) => {
    setAppState(last => ({ ...last, currentItem: item }));
  }

  const selectPlatform = (platform: string | undefined = undefined) => {
    setAppState(last => ({ ...last, currentPlatform: platform }));
  }

  useEffect(() => {
    toggleLoading(false);
  }, [queryResult]);

  return (
    <>
      {appState.loading &&
        <div className='loading'>
          <div className="loading-indicator"></div>
        </div>
      }
      {appState.currentItem && <Overlay item={appState.currentItem} close={() => selectItem()} />}
      <div className='header'>
        <h1>Game Archive Transfer Engine</h1>
        <form onSubmit={(e) => { e.preventDefault(); query(appState.searchTerm); toggleLoading(true) }} className='search-field'>
          <input type='text' onChange={(evt) => setAppState(last => ({ ...last, searchTerm: evt.target.value }))} placeholder='Search...' />
          <button>Search</button>
        </form>
      </div>
      {platforms &&
        <div className="chips">
          {platforms.length > 0 && <span>Filter by platform: </span>}
          {platforms.map((platform, index) =>
            <span key={index} className={`chip ${platform === appState.currentPlatform ? 'active' : ''}`} onClick={() => selectPlatform(platform)}>{platform}</span>
          )}
          {platforms.length > 0 && <span className={`chip danger`} onClick={() => selectPlatform()}>clear</span>}
        </div>
      }
      <div>
        {platforms.filter(p => !appState.currentPlatform || p === appState.currentPlatform).map((platform, index) =>
          <section key={index} className='platform-section'>
            <h2> {platform} </h2>
            <div className='row'>
              {queryResult[platform].map((item, index) =>
                <div key={index} className='item' onClick={() => selectItem(item)}>
                  <img src={item.cover} alt="" />
                  {countryEmoji(item.region) && <span className="location">{countryEmoji(item.region)}</span>}
                  <span className="ribbon">{item.provider}</span>
                  <div>
                    <h3>{item.name}</h3>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

const Overlay = ({ item, close }: { item: SearchResult, close: () => void }) => {

  const { downloadInfo, fetchDownloadInfo } = useDownloadInfo();
  const { details, fetchDetails } = useDetails();
  const [currentOption, setCurrentOption] = useState('links');

  const [activeClass, setActiveClass] = useState('')

  const headerFactory: () => Record<string, string> = () => {
    return {};
  }

  useEffect(() => {
    setActiveClass('active');
    fetchDownloadInfo(item.sku, item.provider);
    fetchDetails(item.sku, item.provider);
  }, [])

  const localClose = () => {
    setActiveClass('')
    setTimeout(() => close(), 300)
  }

  return (
    <div className="item-view-overlay">
      <div className={`item-view-dialog ${activeClass}`}>
        <div className="close-button" onClick={() => localClose()}>Close</div>
        <div className="hero">
          <div className="figure">
            <img src={item.cover} alt="" />
          </div>
          <div className="data-sheet">
            <div>
              <h2>{item.name}</h2>
            </div>
            <div className="description">
              {details?.notes?.split('\n').map((line: string, index: number) => <p key={index}>{line}</p>) || ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}