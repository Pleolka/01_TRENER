import styled from 'styled-components';

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: system-ui, sans-serif;
  color: #1a1a1a;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #eee;
`;

const Logo = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;

  a {
    color: #444;
    text-decoration: none;
    font-size: 0.95rem;

    &:hover {
      color: #000;
    }
  }
`;

const Hero = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1.5rem;
  gap: 1.25rem;
`;

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3.25rem);
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #555;
  max-width: 32rem;
  margin: 0;
`;

const CtaButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.85rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: #111;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    background: #000;
    transform: translateY(-1px);
  }
`;

const Footer = styled.footer`
  padding: 1.5rem;
  text-align: center;
  color: #888;
  font-size: 0.85rem;
  border-top: 1px solid #eee;
`;

export default function Home() {
  return (
    <Page>
      <Header>
        <Logo>Trener Shop</Logo>
        <Nav>
          <a href="#">Sklep</a>
          <a href="#">O mnie</a>
          <a href="#">Kontakt</a>
        </Nav>
      </Header>

      <Hero>
        <Title>Sklep w budowie</Title>
        <Subtitle>
          Strona startowa uruchomiona na Astro + styled-components.
          Kolejne kroki: CMS, płatności i koszyk.
        </Subtitle>
        <CtaButton>Wkrótce dostępne</CtaButton>
      </Hero>

      <Footer>&copy; {new Date().getFullYear()} Trener Shop</Footer>
    </Page>
  );
}
