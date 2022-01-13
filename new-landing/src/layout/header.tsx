import { Background } from '../components/background/Background';
import { Section } from './Section';
import { NavbarTwoColumns } from '../components/navigation/NavbarTwoColumns';
import { Logo } from '../templates/Logo';

type Props = {
	theme: string;
};

export default function Header(props: Props) {
    return (
        <Background color="bg-transparent fixed w-full">
            <Section yPadding="py-6">
                <NavbarTwoColumns logo={<Logo xl noTheme />} noTheme theme={props.theme}>
                </NavbarTwoColumns>
            </Section>
        </Background>
    );
}

export { Header };
