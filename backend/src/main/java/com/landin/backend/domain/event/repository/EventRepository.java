package com.landin.backend.domain.event.repository;

import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.event.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, String> {
    List<Event> findByStatus(EventStatus status);
    List<Event> findByFeaturedTrue();
    List<Event> findByStatusIn(List<EventStatus> statuses);
}
