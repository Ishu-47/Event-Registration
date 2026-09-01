package com.busy.event_registration.service;

import com.busy.event_registration.dto.EventRequest;
import com.busy.event_registration.dto.EventResponse;
import com.busy.event_registration.entity.Event;
import com.busy.event_registration.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public EventResponse create(EventRequest request) {

        validateDates(request);

        Event event = Event.builder()
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .startDateTime(request.getStartDateTime())
                .endDateTime(request.getEndDateTime())
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(eventRepository.save(event));
    }

    public List<EventResponse> getAll() {

        return eventRepository.findAll().stream()
                .map(this::toResponse).toList();
    }

    public EventResponse getById(Long id) {

        Event event = findEvent(id);

        return toResponse(event);
    }

    public EventResponse update(Long id, EventRequest request) {

        validateDates(request);

        Event event = findEvent(id);

        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setStartDateTime(request.getStartDateTime());
        event.setEndDateTime(request.getEndDateTime());

        return toResponse(eventRepository.save(event));
    }

    public void delete(Long id) {

        Event event = findEvent(id);

        eventRepository.delete(event);
    }

    private Event findEvent(Long id) {

        return eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + id));
    }

    private void validateDates(EventRequest request) {

        if (!request.getEndDateTime().isAfter(request.getStartDateTime())) {
            throw new IllegalArgumentException("Event end time must be after start time");
        }
    }

    private EventResponse toResponse(Event event) {

        return EventResponse.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .location(event.getLocation())
                .startDateTime(event.getStartDateTime())
                .endDateTime(event.getEndDateTime())
                .createdAt(event.getCreatedAt())
                .build();
    }
}