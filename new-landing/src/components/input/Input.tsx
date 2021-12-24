import { FaRegQuestionCircle } from "react-icons/fa";

type IInputProps = {
    title: string;
    placeHolder: string;
    type: string;
    tip?: boolean;
};

const Input = (props: IInputProps) => {
    return (
        <div>
            <h2 className='flex text-indigo-900 font-bold text-sm my-3 items-center'>
                {props.title}
                {
                    props.tip && 
                    <FaRegQuestionCircle className="ml-2" size='15px' fill='#312880' />
                }
            </h2>
            <input type={props.type} className='w-full rounded text-indigo-900 border-gray-400 border-solid border px-3 py-2' placeholder={props.placeHolder} />
        </div>
    );
};

export { Input };
