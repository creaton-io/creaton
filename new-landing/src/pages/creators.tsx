import {useRouter} from 'next/router';
import MainLayout from '../layout/MainLayout';
import {FaSearch} from 'react-icons/fa';

type IndexProps = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  handleSwitch: Function;
  theme: string;
};

export default function Index(props: IndexProps) {
  const data = [
    {
      title: 'Creaton',
      content: 'The Official Creaton Creaton account!',
      image: 'creator1.png',
    },
    {
      title: 'Valera Pevnev',
      content: 'Designer',
      image: 'creator2.png',
    },
    {
      title: 'Emy Lascan',
      content: 'I create unique experiences for your online brand',
      image: 'creator3.png',
    },
    {
      title: 'Shafeez Walji',
      content: 'Brand / Graphic Design, Product Design, UX Design',
      image: 'creator4.png',
    },
    {
      title: 'Jasmine Roberts',
      content: '#augmented reality #virtual reality',
      image: 'creator5.png',
    },
    {
      title: 'Jordan Hughes',
      content: 'You have come to the right place',
      image: 'creator6.png',
    },
    {
      title: 'Ha Duong',
      content: 'Brand / Graphic Design / Illustration',
      image: 'creator7.png',
    },
    {
      title: 'Taqiyuddin amri',
      content: 'Design & illustration Enthusiast',
      image: 'creator8 .png',
    },
    {
      title: 'Zhenya Artemjev',
      content: 'Graphic designer & illustrator',
      image: 'creator9.png',
    },
    {
      title: 'Victoria Fernández',
      content: 'Designer',
      image: 'creator10.png',
    },
    {
      title: 'Raúl Gil',
      content: 'Brand / Graphic Design',
      image: 'creator11.png',
    },
    {
      title: 'Panic',
      content: 'Illustrator',
      image: 'creator12.png',
    },
  ];
  const router = useRouter();

  return (
    <MainLayout theme={props.theme} handleSwitch={props.handleSwitch}>
      <div className="container flex flex-col mx-auto">
        <h1 className={`${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} text-xl font-bold pt-4 pb-2`}>
          Creators
        </h1>
        <div className="flex justify-between">
          <p className={`${props.theme === 'dark' ? 'text-white opacity-80' : 'text-gray-500'} text-sm`}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          </p>
          <div className="relative">
            <input
              type="text"
              className={`${props.theme === 'dark' ? 'bg-transparent' : ''} w-80 rounded-lg text-indigo-900 ${
                props.theme === 'dark' ? 'border-border-200' : 'border-border-100'
              } border-solid border px-3 py-2`}
              placeholder="Search for creators..."
            />
            <FaSearch
              className="absolute top-3 right-2 w-5 h-5"
              fill={`${props.theme === 'dark' ? '#FFFFFF' : '#312880'}`}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3  gap-6 pt-8">
          {data.map((
            item //,index
          ) => (
            <div
              className={`${
                props.theme === 'dark' ? 'border-border-200' : 'border-border-100'
              } rounded-lg border border-solid p-4`}
            >
              <img src={`${router.basePath}/assets/images/${item.image}`} alt={'Creator Image'} />
              <p className={`${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} font-bold py-1`}>
                {item.title}
              </p>
              <p className={`${props.theme === 'dark' ? 'text-white opacity-80' : 'text-gray-500'} text-sm`}>
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export {Index};
