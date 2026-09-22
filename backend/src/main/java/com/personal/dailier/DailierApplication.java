package com.personal.dailier;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DailierApplication {

    public static void main(String[] args) {
	SpringApplication.run(DailierApplication.class, args);
    }

}
