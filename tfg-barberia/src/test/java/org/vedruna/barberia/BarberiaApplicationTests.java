package org.vedruna.barberia;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Pruebas de arranque de la aplicacion Spring Boot.
 */
@SpringBootTest(properties = "debug=false")
class BarberiaApplicationTests {

	/**
	 * Verifica que el contexto completo de Spring arranca con la configuracion actual.
	 */
	@Test
	void contextLoads() {
	}

}

