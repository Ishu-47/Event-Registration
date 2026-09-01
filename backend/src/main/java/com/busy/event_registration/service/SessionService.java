package com.busy.event_registration.service;

import com.busy.event_registration.dto.SessionRequest;
import com.busy.event_registration.dto.SessionResponse;
import com.busy.event_registration.entity.Event;
import com.busy.event_registration.entity.Session;
import com.busy.event_registration.repository.EventRepository;
import com.busy.event_registration.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final EventRepository eventRepository;

    public SessionResponse create(Long eventId, SessionRequest request) {

        Event event = findEvent(eventId);

        validateDates(request);

        Session session = Session.builder()
                .event(event)
                .title(request.getTitle())
                .description(request.getDescription())
                .startDateTime(request.getStartDateTime())
                .endDateTime(request.getEndDateTime())
                .capacity(request.getCapacity())
                .build();

        return toResponse(sessionRepository.save(session));
    }

    public List<SessionResponse> getByEvent(Long eventId) {
        findEvent(eventId);

        return sessionRepository.findByEventId(eventId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public SessionResponse getById(Long id) {
        return toResponse(findSession(id));
    }

    public SessionResponse update(Long id, SessionRequest request) {

        Session session = findSession(id);

        validateDates(request);

        session.setTitle(request.getTitle());
        session.setDescription(request.getDescription());
        session.setStartDateTime(request.getStartDateTime());
        session.setEndDateTime(request.getEndDateTime());
        session.setCapacity(request.getCapacity());

        return toResponse(sessionRepository.save(session));
    }

    public void delete(Long id) {
        sessionRepository.delete(findSession(id));
    }

    private Event findEvent(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + id));
    }

    private Session findSession(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with id: " + id));
    }

    private void validateDates(SessionRequest request) {

        if (!request.getEndDateTime()
                .isAfter(request.getStartDateTime())) {

            throw new IllegalArgumentException("Session end time must be after start time");
        }
    }

    private SessionResponse toResponse(Session session) {

        return SessionResponse.builder()
                .id(session.getId())
                .eventId(session.getEvent().getId())
                .title(session.getTitle())
                .description(session.getDescription())
                .startDateTime(session.getStartDateTime())
                .endDateTime(session.getEndDateTime())
                .capacity(session.getCapacity())
                .build();
    }
}