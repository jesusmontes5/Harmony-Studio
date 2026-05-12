package org.vedruna.barberia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Clase principal de arranque de la aplicacion.
 *
 * <p>La anotacion {@link SpringBootApplication} agrupa:
 * <ul>
 *   <li>{@code @Configuration} para definir beans.</li>
 *   <li>{@code @EnableAutoConfiguration} para autoconfigurar Spring Boot.</li>
 *   <li>{@code @ComponentScan} para descubrir componentes en el paquete base.</li>
 * </ul>
 */
@SpringBootApplication
@EnableScheduling
public class BarberiaApplication {

    /**
     * Metodo de entrada de la aplicacion.
     *
     * @param args argumentos de linea de comandos.
     */
    public static void main(String[] args) {
        SpringApplication.run(BarberiaApplication.class, args);
    }
}
