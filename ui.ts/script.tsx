import dayjs from 'dayjs';

import AWSClient from './aws-client';
import { parse } from './html-parser';
import { createListItem } from './react-helper';

window.addEventListener('load', (ev: Event) => {
  const region = 'ap-northeast-2';
  const client = new AWSClient(region);

  const elements = {
    strType: document.querySelector<HTMLSelectElement>('#strType'),
    SYY: document.querySelector<HTMLInputElement>('#SYY'),
    SMM: document.querySelector<HTMLInputElement>('#SMM'),
    SDD: document.querySelector<HTMLInputElement>('#SDD'),
    EYY: document.querySelector<HTMLInputElement>('#EYY'),
    EMM: document.querySelector<HTMLInputElement>('#EMM'),
    EDD: document.querySelector<HTMLInputElement>('#EDD'),
    query: document.querySelector<HTMLButtonElement>('#query'),
    reset: document.querySelector<HTMLButtonElement>('#reset'),
    list: document.querySelector<HTMLDivElement>('#list'),
  };

  const today = dayjs();
  const defaultValues = {
    strType: 1,
    SYY: today.year(),
    SMM: today.month() + 1,
    SDD: 1,
    EYY: today.year(),
    EMM: today.month() + 1,
    EDD: today.date(),
  };
  const queryElementKeys: string[] = Object.keys(defaultValues);
  queryElementKeys.forEach((key: string) => {
    elements[key].value = localStorage.getItem(`query.${key}`) || defaultValues[key];
    localStorage.setItem(`query.${key}`, elements[key].value);
  });
  elements.SYY.max = `${today.year()}`;
  elements.SDD.max = `${dayjs(`${elements.SYY.value}-${elements.SMM.value}-01`).daysInMonth()}`;
  elements.EYY.max = `${today.year()}`;
  elements.EDD.max = `${dayjs(`${elements.EYY.value}-${elements.EMM.value}-01`).daysInMonth()}`;

  elements.strType.addEventListener('change', (ev: Event) => {
    localStorage.setItem(`query.strType`, elements.strType.value);
  });
  elements.SYY.addEventListener('change', (ev: Event) => {
    localStorage.setItem(`query.SYY`, elements.SYY.value);
  });
  elements.SMM.addEventListener('change', (ev: Event) => {
    localStorage.setItem(`query.SMM`, elements.SMM.value);
    const isSDDMax = parseInt(elements.SDD.value) === parseInt(elements.SDD.max);
    elements.SDD.max = `${dayjs(`${elements.SYY.value}-${elements.SMM.value}-1`).daysInMonth()}`;
    if (isSDDMax) {
      elements.SDD.value = elements.SDD.max;
    } else {
      elements.SDD.value = `${Math.min(parseInt(elements.SDD.value), parseInt(elements.SDD.max))}`;
    }
  });
  elements.SDD.addEventListener('change', (ev: Event) => {
    localStorage.setItem(`query.SDD`, elements.SDD.value);
  });
  elements.EYY.addEventListener('change', (ev: Event) => {
    localStorage.setItem(`query.EYY`, elements.EYY.value);
  });
  elements.EMM.addEventListener('change', (ev: Event) => {
    localStorage.setItem(`query.EMM`, elements.EMM.value);
    const isSDDMax = parseInt(elements.EDD.value) === parseInt(elements.EDD.max);
    elements.EDD.max = `${dayjs(`${elements.EYY.value}-${elements.EMM.value}-1`).daysInMonth()}`;
    if (isSDDMax) {
      elements.EDD.value = elements.EDD.max;
    } else {
      elements.EDD.value = `${Math.min(parseInt(elements.EDD.value), parseInt(elements.EDD.max))}`;
    }
  });
  elements.EDD.addEventListener('change', (ev: Event) => {
    localStorage.setItem(`query.EDD`, elements.EDD.value);
  });
  elements.query.addEventListener('click', (ev: MouseEvent) => {
    const queryObject = Object.fromEntries(queryElementKeys.map((key: string) => [key, elements[key].value]));
    client
      .callLambdaFunction('tjmedia-popular', queryObject)
      .then(
        (data: string) => {
          const html: string = JSON.parse(data);
          const virtualDocument: Document = parse(html);
          Array.from(virtualDocument.querySelectorAll<HTMLTableRowElement>('#BoardType1 tr'))
            .slice(1)
            .forEach((tr: HTMLTableRowElement, i: number) => {
              const tds = tr.querySelectorAll<HTMLTableCellElement>('td');
              const index: number = parseInt(tds[0].textContent);
              const title: string = tds[2].textContent;
              const artist: string = tds[3].textContent;
              const node = createListItem(index, title, artist) as ParentNode;
              node.addEventListener('click', (ev: Event) => {
                const title = node.querySelector<HTMLElement>('.title').textContent;
                const artist = node.querySelector<HTMLElement>('.artist').textContent;
                client
                  .callLambdaFunction('youtube-search', { search_query: `${artist} ${title}` })
                  .then((data: string) => {
                    const html: string = JSON.parse(data);
                    const virtualDocument: Document = parse(html);
                    const startKey = 'var ytInitialData = ';
                    const script: string = Array.from(virtualDocument.querySelectorAll<HTMLScriptElement>('script'))
                      .filter((script: HTMLScriptElement) => script.textContent.startsWith(startKey))
                      .shift().textContent;
                    const ytInitialData: YtInitialData = JSON.parse(script.slice(startKey.length, -1));
                    for (let c1 of ytInitialData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents) {
                      if (c1.itemSectionRenderer) {
                        for (let c2 of c1.itemSectionRenderer.contents) {
                          if (c2.videoRenderer) {
                            const videoId = c2.videoRenderer.videoId;
                            const maxThumbnail: YtInitialDataThumbnail = c2.videoRenderer.thumbnail.thumbnails.reduce(
                              (previousValue: YtInitialDataThumbnail, currentValue: YtInitialDataThumbnail) => {
                                const x = (previousValue.width ** 2 + previousValue.height ** 2) ** 0.5;
                                const y = (currentValue.width ** 2 + currentValue.height ** 2) ** 0.5;
                                return x > y ? previousValue : currentValue;
                              },
                            );
                            for (let r of c2.videoRenderer.title.runs) {
                              const title = r.text;
                              const video = node.querySelector<HTMLDivElement>('.video');
                              if (video.style.display === 'none') {
                                video.style.display = 'block';
                                const iframe = video.querySelector<HTMLIFrameElement>('iframe');
                                iframe.src = `https://www.youtube.com/embed/${videoId}`;
                                iframe.title = title;
                                iframe.width = `${video.clientWidth}`;
                                iframe.height = `${video.clientWidth * (maxThumbnail.height / maxThumbnail.width)}`;
                              }
                            }
                          }
                        }
                      }
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              });
              if (i < elements.list.childElementCount) {
                elements.list.replaceChild(node, elements.list.childNodes[i]);
              } else {
                elements.list.appendChild(node);
              }
            });
        },
        (error) => {
          console.error(error);
        },
      )
      .catch((error) => {
        console.error(error);
      });
  });
  elements.reset.addEventListener('click', (ev: MouseEvent) => {
    queryElementKeys.forEach((key: string) => {
      elements[key].value = defaultValues[key];
      localStorage.setItem(`query.${key}`, elements[key].value);
    });
  });
});
