import { useRouter } from 'next/router';

import { Background } from '../components/background/Background';
import { Section } from './Section';
import { NavbarTwoColumns } from '../components/navigation/NavbarTwoColumns';
import { Logo } from '../templates/Logo';

export default function Header() {
    const router = useRouter();
    return (
        <Background color="bg-transparent fixed w-full">
            <Section yPadding="py-6">
                <NavbarTwoColumns logo={<Logo xl />}>
                </NavbarTwoColumns>
            </Section>
        </Background>
    );
}

export { Header };
