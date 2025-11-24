import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

export async function createDriver() {
  // Opciones de Chrome
  const options = new chrome.Options();

  // Opcional: ejecución en modo headless moderno
  options.addArguments("--headless=new");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");

  // Crear servicio del ChromeDriver (ChromeDriver se coge del PATH)
  const service = new chrome.ServiceBuilder();

  // Crear driver
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(service)
    .build();

  return driver;
}